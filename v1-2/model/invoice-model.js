const { custom } = require('@hapi/joi');
const Joi = require('@hapi/joi');
const pool = require('../startup/db');
const { getCommission } = require('./commission-model');
const { getCustomer } = require('./customer-model');
const { getEUcountries } = require('../model/state-model');

//validation
const validate = (invoice) => {
  const schema = Joi.object({
    invoice_id: Joi.number().min(1).max(2147483647),
    commission_id: Joi.number().min(1).max(2147483647),
    user_id: Joi.number().min(1).max(2147483647),
    constantSymbol: Joi.string().allow(null, ''),
    issueDate: Joi.number().allow(null).optional(),
    dueDate: Joi.number().allow(null).optional(),
    pointDate: Joi.number().allow(null).optional(),
    paymentMethod: Joi.string().allow(null, '').optional(),
    text: Joi.string().allow(null, '').optional(),
    language: Joi.string().allow(null, '').optional(),
    paid: Joi.boolean().optional(),
    invoiceSent: Joi.boolean().optional(),
    invoiceNumber: Joi.number().allow(null).optional(),
    valueAddedTax: Joi.number().allow(null).optional(),
    canceled: Joi.boolean().optional(),
    reverseCharge: Joi.boolean().optional(),
  });
  return schema.validate(invoice);
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

const validateExportBody = (body) => {
  const schema = Joi.array().items(Joi.number());
  return schema.validate(body);
};

const get = async (id = false) => {
  let query = {
    text: 'SELECT invoice.*, "complete_commission"."commission_id", "complete_commission"."orderNumber", "complete_commission"."orderDate" from "complete_commission" NATURAL JOIN  "invoice" where invoice_id=$1',
    values: [id],
  };

  try {
    pgres = await pool.query(query);
    const result = pgres.rows[0];
    const invoiceNumber = await getLatestInvoiceNumber();

    if (!result.invoiceNumber) result.invoiceNumber = invoiceNumber;

    return result;
  } catch (error) {
    return { error_code: 404, error_message: error.stack };
  }
};

const getAll = async (year = false) => {
  let query = {
    text: 'SELECT * from "complete_commission" NATURAL JOIN  "invoice" where deleted = false',
  };

  if (year)
    query = {
      text: 'SELECT * from "complete_commission" NATURAL JOIN  "invoice" WHERE year = $1 AND deleted = false',
      values: [year],
    };

  try {
    pgres = await pool.query(query);
    return pgres.rows;
  } catch (error) {
    return { error_code: 404, error_message: error.stack };
  }
};

const getLatestInvoiceNumber = async () => {
  let query = {
    text: 'SELECT MAX("invoiceNumber") FROM invoice;',
  };

  try {
    pgres = await pool.query(query);
    let invoiceNumber = new Date().getFullYear().toString() + '0001';

    if (pgres.rows[0].max) {
      invoiceNumber = Number(pgres.rows[0].max) + 1;
    }

    return invoiceNumber;
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const update = async (id, data) => {
  let query = {
    text: `SELECT invoice_id from invoice where invoice_id = $1`,
    values: [id],
  };

  try {
    pgres = await pool.query(query);
    if (pgres.rows.length === 0)
      return {
        error_code: 404,
        error_message: 'Requested invoice was not found',
      };
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }

  let counter = 1;
  let updateQuery = 'update invoice set';
  for (const [key, value] of Object.entries(data)) {
    updateQuery += `"${key}"=$${counter++},`;
  }
  updateQuery = ` ${updateQuery.replace(
    /.$/,
    '',
  )} where "invoice_id" = '${id}' RETURNING *`;

  query = {
    text: updateQuery,
    values: Object.values(data),
  };

  try {
    pgres = await pool.query(query);
    return pgres.rows[0];
  } catch (error) {
    return { error_code: 500, error_message: error.stack };
  }
};

const creatXmlInvoices = async (invoices) => {
  let response = [],
    updatedIds = [];
  let cache = {
    customers: {},
    customerContacts: {},
    euCountriues: await getEUcountries(),
  };

  const parseDate = (date, offset = -120) => {
    date = new Date(Number(date));
    return new Date(date.getTime() - offset * 60000)
      .toISOString()
      .split('T')[0];
  };
  const parsePaymentType = (type) => {
    const types = {
      null: 'draft',
      příkazem: 'draft',
      hotově: 'cash',
      složenkou: 'postal',
      dobirka: 'delivery',
      kartou: 'creditcard',
      zalohou: 'advance',
      inkasem: 'encashment',
      šekem: 'cheque',
      zápočtem: 'compensation',
    };
    return types[type];
  };

  const parseVatRate = (percentage) => {
    const types = {
      null: 'high',
      0: 'none',
      21: 'high',
      15: 'low',
      10: 'third',
    };
    return types[percentage];
  };

  let translate = (language, word) => {
    const words = {
      čeština: {
        přeprava: 'Přeprava',
      },
      angličtina: {
        přeprava: 'Transportation',
      },
      němčina: {
        přeprava: 'Transport',
      },
    };

    return words[language] && words[language][word]
      ? words[language][word]
      : words['čeština'][word];
  };

  const parseAccount = (language = 'čeština', currencyCustomer) => {
    if (currencyCustomer == 'CZK') return 'KB';
    if (language == 'čeština' && currencyCustomer !== 'CZK') return 'FIOE';
    if (currencyCustomer !== 'CZK') return 'Efio';
  };

  const getClassificationVAT = async (relation, cache) => {
    // jiny clensky stat v EU - USregEU
    // tuzemske plneni - UD
    const destination =
      relation.length == 2 ? relation : relation.substring(2, 4);
    if (destination == 'CZ') return 'UD';
    if (cache.euCountriues.find((country) => country == destination))
      return 'USregEU';

    return 'UD';
  };

  const xmlHead = `<?xml version="1.0" encoding="UTF-8"?>
  <dat:dataPack id="${parseDate(
    Date.now(),
  )}" ico="29316880" application="qapline xml processor" version="2.0" note="Import FA" xmlns:dat="http://www.stormware.cz/schema/version_2/data.xsd" xmlns:inv="http://www.stormware.cz/schema/version_2/invoice.xsd" xmlns:typ="http://www.stormware.cz/schema/version_2/type.xsd">`;
  const xmlTail = `</dat:dataPack>`;

  for await (const invoiceId of invoices) {
    const invoice = await creatXmlInvoice(invoiceId, cache, {
      parseDate,
      parsePaymentType,
      parseVatRate,
      parseAccount,
      getClassificationVAT,
      translate,
    });
    if (invoice) {
      response.push(invoice);
      updatedIds.push(invoiceId);
    }
  }

  if (updatedIds.length > 0) {
    let query = `UPDATE invoice set "exported" = '1' where "invoice_id" in (${updatedIds.join(
      ',',
    )})`;
    await pool.query(query);
  } else {
    return {
      error: {
        message: 'Všechny faktury v požadavku byli již dřívě vyexportovány',
      },
    };
  }

  return `${xmlHead} ${response.join('')} ${xmlTail}`;
};

const creatXmlInvoice = async (invoiceId, cache, helpers) => {
  let currencyBlok, foreignCurrency;
  const {
    parseDate,
    parsePaymentType,
    parseVatRate,
    parseAccount,
    getClassificationVAT,
    translate,
  } = helpers;
  const {
    invoice_id,
    invoiceNumber,
    text,
    orderNumber,
    orderDate,
    constantSymbol = 0,
    issueDate,
    dueDate,
    pointDate,
    paymentMethod,
    commission_id,
    valueAddedTax,
    language,
    reverseCharge,
    exported,
  } = await get(invoiceId);

  const timzoneOffset = 7200000;

  if (exported) return false;

  const { customer_id, priceCustomer, currencyCustomer, relation } =
    await getCommission(commission_id);

  // get customer
  let customer = cache.customers[customer_id];
  if (!customer) {
    customer = await getCustomer(customer_id);
    cache.customers[customer_id] = customer;
  }

  const invNumberOrder = orderNumber
    ? `\n<inv:numberOrder>${orderNumber}</inv:numberOrder>`
    : '';
  const invDateOrder = orderDate
    ? `\n<inv:dateOrder>${parseDate(orderDate)}</inv:dateOrder>`
    : '';
  const invDateDue = dueDate
    ? `\n<inv:dateDue>${parseDate(dueDate)}</inv:dateDue>`
    : '';
  const invDate = issueDate
    ? `\n<inv:date>${parseDate(issueDate)}</inv:date>`
    : '';
  // +2h to convert from utc to cet
  const invDateTax = pointDate
    ? `\n<inv:dateTax>${parseDate(pointDate)}</inv:dateTax>`
    : '';
  const companyName = customer.firstName
    ? `\n<typ:name>${customer.firstName} ${customer.lastName}</typ:name>`
    : '';
  const ico = customer.companyRegistrationNumber
    ? `\n<typ:ico>${customer.companyRegistrationNumber}</typ:ico>`
    : '';
  const dic = customer.taxId ? `\n<typ:dic>${customer.taxId}</typ:dic>` : '';
  const typCountry =
    customer.place.countryCode == 'CZ'
      ? ''
      : `\n<typ:country><typ:ids>${customer.place.countryCode}</typ:ids></typ:country>`;
  const unitPrice =
    priceCustomer === null || !priceCustomer ? 0 : priceCustomer;

  if (currencyCustomer == 'CZK') {
    currencyBlok = `\n<inv:homeCurrency>
    <typ:unitPrice>${unitPrice}</typ:unitPrice>
  </inv:homeCurrency>`;
    foreignCurrency = '';
  } else {
    currencyBlok = `\n<inv:foreignCurrency>
  <typ:unitPrice>${unitPrice}</typ:unitPrice>
  </inv:foreignCurrency>`;
    foreignCurrency = `\n<inv:foreignCurrency>
  <typ:currency>
      <typ:ids>EUR</typ:ids>
  </typ:currency>
</inv:foreignCurrency>`;
  }

  return `<dat:dataPackItem id="${invoice_id}" version="2.0">
  <inv:invoice version="2.0">
  <inv:invoiceHeader>
      <inv:invoiceType>issuedInvoice</inv:invoiceType>${invDateDue}${invDate}${invDateTax}
      <inv:symConst>${Number(constantSymbol)}</inv:symConst>  
      <inv:number>
          <typ:numberRequested>${invoiceNumber}</typ:numberRequested>
      </inv:number>
      <inv:accounting>
          <typ:ids>${
            customer.place.countryCode == 'CZ' ? '602100' : '602100zahr'
          }</typ:ids>
      </inv:accounting>
      <inv:classificationVAT>
          <typ:ids>${await getClassificationVAT(relation, cache)}</typ:ids>
      </inv:classificationVAT>
      <inv:text>${text ? text : ''}</inv:text>
      <inv:partnerIdentity>
          <typ:address>${ico}${dic}
              <typ:company>${customer.company}</typ:company>${companyName}
              <typ:city>${customer.place.city}</typ:city>
              <typ:street>${customer.place.street}</typ:street>
              <typ:zip>${customer.place.postalCode}</typ:zip>${typCountry}
          </typ:address>
      </inv:partnerIdentity>${invNumberOrder}${invDateOrder}
      <inv:paymentType>
          <typ:paymentType>${parsePaymentType(paymentMethod)}</typ:paymentType>
      </inv:paymentType>
      <inv:account>
           <typ:ids>${parseAccount(language, currencyCustomer)}</typ:ids>
      </inv:account>
      <inv:note />
  </inv:invoiceHeader>
  <inv:invoiceDetail>
      <inv:invoiceItem>
          <inv:text>${translate(language, 'přeprava')}</inv:text>
          <inv:quantity>1</inv:quantity>
          <inv:rateVAT>${parseVatRate(valueAddedTax)}</inv:rateVAT>
          <inv:PDP>${reverseCharge}</inv:PDP>${currencyBlok}
      </inv:invoiceItem>
  </inv:invoiceDetail>
  <inv:invoiceSummary>
      <inv:roundingVAT>noneEveryRate</inv:roundingVAT>${foreignCurrency}
  </inv:invoiceSummary>
</inv:invoice>
</dat:dataPackItem>`;
};

exports.getInvoice = get;
exports.getInvoices = getAll;
exports.updateInvoice = update;
exports.validateParams = validateParams;
exports.validateInvoice = validate;
exports.creatXmlInvoice = creatXmlInvoice;
exports.validateExportBody = validateExportBody;
exports.creatXmlInvoices = creatXmlInvoices;
