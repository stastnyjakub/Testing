const pool = require('../../startup/db');
const Joi = require('@hapi/joi');
const {
  findOne: findOneCommission,
  findOneCommission: findOneCom,
  update: updateCommission,
} = require('./commission-model');
const { findOne: findOneCustomer } = require('./customer-model');
const { updator, exist, selector } = require('./tools/database-manipulation');
const { getCZKrates } = require('../rate-model');

const validateId = (params) => {
  const schema = Joi.object({
    id: Joi.number().min(1).max(2147483647).messages({
      'any.required': `Id faktury je špatně zadáno`,
    }),
  });
  return schema.validate(params);
};

const validateRequestBody = (body) => {
  const schema = Joi.object({
    invoice_id: Joi.number(),
    canceled: Joi.bool().allow(null, ''),
    constantSymbol: Joi.string().allow(null, ''),
    dueDate: Joi.string().allow(null, ''),
    exported: Joi.bool().allow(null, ''),
    invoiceNumber: Joi.number().allow(null, ''),
    invoiceSent: Joi.bool().allow(null, ''),
    issueDate: Joi.string().allow(null, ''),
    language: Joi.string().allow(null, ''),
    paid: Joi.bool().allow(null, ''),
    paymentMethod: Joi.string().allow(null, ''),
    pointDate: Joi.string().allow(null, ''),
    reverseCharge: Joi.bool().allow(null, ''),
    text: Joi.string().allow(null, ''),
    valueAddedTax: Joi.number().allow(null, ''),
    commission: Joi.object({
      commission_id: Joi.number(),
      currencyCarrier: Joi.string().allow(null, ''),
      currencyCustomer: Joi.string().allow(null, ''),
      exchangeRateCarrier: Joi.alternatives().try(
        Joi.string().allow(null, ''),
        Joi.number(),
      ),
      exchangeRateCustomer: Joi.alternatives().try(
        Joi.string().allow(null, ''),
        Joi.number(),
      ),
      orderDate: Joi.string().allow(null, ''),
      orderNumber: Joi.alternatives().try(
        Joi.string().allow(null, ''),
        Joi.number(),
      ),
      priceCustomer: Joi.string().allow(null, ''),
      vat: Joi.string().allow(null, ''),
    }),
  });
  return schema.validate(body);
};

const validateParams = (params) => {
  const schema = Joi.object({
    id: Joi.number().min(1).max(2147483647).messages({
      'any.required': `Id faktury je špatně zadáno`,
    }),
    commissionId: Joi.number().min(1).max(2147483647),
    ordering: Joi.string().allow(null, '').valid('asc', 'desc', ''),
    order_by: Joi.alternatives().try(
      Joi.string().allow(null, ''),
      Joi.number(),
    ),
    limit: Joi.number(),
    after: Joi.number(),
    year: Joi.number(),
  });
  return schema.validate(params);
};

const validateText = (params) => {
  const schema = Joi.object({
    invoice: Joi.number().min(1).max(2147483647).required(),
    languageCode: Joi.string().valid('en', 'de', 'cs').required(),
  });
  return schema.validate(params);
};

const find = async (params, filters) => {
  let search;
  if (filters._search) {
    search = {
      value: filters._search,
      query: [
        'CAST("invoiceNumber" AS TEXT) like',
        'CAST(customer_company AS TEXT) ilike',
        'CAST("orderNumber" AS TEXT) ilike',
        'text ilike',
      ],
    };
  }

  const invoices = await selector(
    params,
    `"complete_commission" NATURAL JOIN  "invoice"`,
    filters,
    search,
    true,
  );
  if (invoices.error_message)
    return { error_code: 404, error_message: invoices.error_message };

  return invoices;
};

const findOne = async (id, params, relations) => {
  const populateRelation = {
    commission: findOneCommission,
    customer: findOneCustomer,
  };

  if (!(await exist(id, 'invoice')))
    return { error_code: 404, error_message: 'Fakturu se nepodařilo najít' };

  const filters = { invoice_id: id };
  const invoices = await selector(
    params,
    `"complete_commission" NATURAL JOIN "invoice"`,
    filters,
  );
  if (invoices.error_message)
    return { error_code: 404, error_message: invoices.error_message };

  try {
    const date = new Date();
    const invoice = invoices[0];

    // invoice dueDate = date + due date from customer
    // datum plnění = datum vykládky (pokud je více vykládek v různé dny, tak to pozdější. Pokud je datum vykládky jako rozmezí, tak taky to pozdější)
    // datum objednávky = datum objednávky z detailu zakázky.
    // denní kurz https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt;jsessionid=1?date=02.05.2022

    invoice.constantSymbol ||= 308;
    invoice.issueDate ||= String(Date.now());
    invoice.language ||= 'čeština';
    invoice.paymentMethod ||= 'příkazem';
    invoice.valueAddedTax ||= 21;

    invoice.invoiceNumber ||= await getNewInvoiceNumber(
      new Date(parseInt(invoice.issueDate)).getFullYear().toString(),
    );

    //if (!invoice.customer_id) throw "Klient nebyl nalezen.";
    // if (invoice.invoiceNumber.error)
    //   throw 'Nepodařilo se vygenerovat číslo faktury.';

    // populate first level relations
    for await (const relation of relations) {
      const key = Object.keys(relation)[0];
      invoice[key] = await populateRelation[key](
        invoice[relation[key].id],
        relation[key].responseParams,
      );
      delete invoice[relation[key].id];
    }
    // populate second level relations
    if (!invoice.commission.customer_id) throw 'Nepodařilo se najít klienta.';

    invoice.customer = await populateRelation.customer(
      invoice.commission.customer_id,
      [
        'customer_id',
        'company',
        'companyRegistrationNumber',
        'place',
        'taxId',
        'defaultDueDate',
      ],
      { customerContact: { responseParams: ['email'] } },
    );
    if (invoice.customer.error_message) throw 'Nepodařilo se najít klienta.';

    // make due date
    const dueDate = invoice.customer.defaultDueDate
      ? invoice.customer.defaultDueDate
      : 30;
    invoice.dueDate ||= String(date.setDate(date.getDate() + dueDate));
    delete invoice.customer.defaultDueDate;

    invoice.text ||= await makeInvoiceText(
      invoice.language,
      invoice.invoice_id,
    );

    invoice.pointDate ||= String(await makePointDate(invoice));

    if (invoice.commission.currencyCustomer == 'EUR') {
      const { rates } = await getCZKrates(Number(invoice.pointDate));
      invoice.eurRate = rates.EUR;
    }

    return invoice;
  } catch (error) {
    return { error_code: 404, error_message: (error.stack ||= error) };
  }
};

const update = async (id, data, params, relations) => {
  let { commission } = data;

  if (!(await exist(id, 'invoice')))
    return { error_code: 404, error_message: 'Fakturu se nepodařilo najít' };

  if (commission) {
    commission = await updateCommission(
      commission.commission_id,
      commission,
      relations[0].commission.responseParams,
    );
    if (commission.error_message)
      return { error_code: 404, error_message: commission.error_message };
    delete data.commission;
  }

  delete data.invoice_id;

  data.dueDate = data.dueDate == '' ? null : data.dueDate;
  data.issueDate = data.issueDate == '' ? null : data.issueDate;
  data.pointDate = data.pointDate == '' ? null : data.pointDate;

  if (!data.invoiceNumber) {
    data.invoiceNumber = await getNewInvoiceNumber(
      data.issueDate
        ? new Date(parseInt(data.issueDate)).getFullYear().toString()
        : new Date().getFullYear().toString(),
    );
  } else {
    console.warn(data);
    // invoice number prefix should be the issue date year
    const issueYear = new Date(parseInt(data.issueDate))
      .getFullYear()
      .toString();
    const invoiceYear = '20' + ('' + data.invoiceNumber).substring(0, 2);

    console.warn(issueYear, invoiceYear);

    if (issueYear !== invoiceYear) {
      console.warn(issueYear);
      data.invoiceNumber = await getNewInvoiceNumber(issueYear);
    }
  }

  const invoice = await updator(id, 'invoice', data, params);
  if (invoice.error_message)
    return { error_code: 404, error_message: invoice.error_message };

  if (commission) invoice.commission = commission;
  invoice.valueAddedTax ||= 21;

  return invoice;
};

const makeInvoiceText = async (language, invoiceId) => {
  // if (language == "angličtina" || language == "en") return ``;
  // if (language == "němčina" || language == "de") return ``;
  // if (language == "angličtina" || language == "en") return ``;

  const invoice = await find(
    [
      'commission_id',
      'loading_city_string',
      'discharge_city_string',
      'relation',
    ],
    { invoice_id: invoiceId },
  );
  if (invoice.error_message)
    return { error_code: 404, error_message: invoice.error_message };
  if (invoice.data.length === 0)
    return {
      error_code: 404,
      error_message: 'makeInvoiceText - invoice not found',
    };

  const {
    commission_id,
    loading_city_string,
    discharge_city_string,
    relation,
  } = invoice.data[0];
  const commission = await findOneCom(commission_id, ['qid']);
  if (commission.error_message)
    return { error_code: 404, error_message: commission.error_message };

  const { qid } = commission;

  if (language == 'angličtina' || language == 'en')
    return `We are invoicing you the agreed price for transport: ${loading_city_string} (${relation.substring(
      0,
      2,
    )}) —> ${discharge_city_string} (${relation.substring(
      2,
      4,
    )}). Our position: ${qid}`;
  if (language == 'němčina' || language == 'de')
    return `Wir senden Ihnen die Rechnung zum vereinbarten Preis für den Transport: ${loading_city_string} (${relation.substring(
      0,
      2,
    )}) —> ${discharge_city_string} (${relation.substring(
      2,
      4,
    )}). Unsere Position: ${qid}`;

  return `Fakturujeme Vám dohodnutou cenu ze přepravu dle Vaší objednávky, přiloženého CMR nákladního listu a potvrzeného dodacího listu. Relace: ${loading_city_string} (${relation.substring(
    0,
    2,
  )}) --> ${discharge_city_string} (${relation.substring(
    2,
    4,
  )}). Naše pozice: ${qid}`;
};

const getNewInvoiceNumber = async (year) => {
  try {
    year = Number(String(year).substring(2, 4));

    pgres = await pool.query(
      `SELECT MAX("invoiceNumber") FROM invoice where "invoiceNumber" > ${year}000000 and "invoiceNumber" < ${year}999999`,
    );

    let invoiceNumber = year + '000001';

    if (pgres.rows[0].max) {
      invoiceNumber = Number(pgres.rows[0].max) + 1;
    }

    return invoiceNumber;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const makePointDate = async (invoice) => {
  let commission_id;
  if (invoice.commission != null) {
    commission_id = invoice.commission.commission_id;
  }
  if (!commission_id) return Date.now();

  let pointDate;

  const discharges = await selector(['date'], 'commissionDischarge', {
    commission_id,
    date_ne: 0,
    deleted: 0,
    _sort: 'date:DESC',
  });

  if (discharges.length > 0) pointDate = discharges[0].date;
  pointDate ||= Date.now();

  return pointDate;
};

module.exports = {
  validateRequestBody,
  validateId,
  validateParams,
  findOne,
  find,
  update,
  getNewInvoiceNumber,
  validateText,
  makeInvoiceText,
  makePointDate,
};
