import { commission, complete_invoice, invoice, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import FormData from 'form-data';
import * as fs from 'fs';
import i18next from 'i18next';
import moment from 'moment-timezone';
import { createEnvironment, createFilesystemLoader, createFilter } from 'twing';
import { create } from 'xmlbuilder2';

import * as attachmentsService from '@/attachment/attachment.service';
import { EAttachmentType } from '@/attachment/types';
import { ATTACH_OR_REPLACE_INVOICE_TRANSACTION_TIMEOUT } from '@/attachment/uploadFiles/uploadFiles.constants';
import { Entity, NotFoundException } from '@/errors';
import { EPrismaClientErrorCodes } from '@/types';
import { generatePdf, ProcessorType } from '@/utils';
import { performTransaction } from '@/utils';

import prisma from '../db/client';
import { t } from '../middleware/i18n';

import { generateInvoiceNumber } from './utils/generateInvoiceNumber';
import { formatDate, getSubstitutions, mapLang } from './utils/pdfHelpers';
import { getRate } from './utils/rates';
import {
  calcPrices,
  dataPackItemParams,
  dataPackParams,
  getClassificationVAT,
  getCommissionValues,
  getPaymentType,
  getQaplineDetails,
  invoiceDetailParams,
  invoiceHeaderParams,
  invoiceParams,
  invoiceSummaryParams,
  parseAccount,
  parseDate,
  parseVatRate,
} from './utils/xmlHelpers';
import { AllInvoicesResponse, InvoiceQueryString, PdfInvoice } from './invoice.interface';
import { PdfPrintSettings } from './types';

export const getCommissionIdsForInvoice = async (invoiceId: number) => {
  const results = await prisma.invoice.findFirst({
    where: {
      invoice_id: invoiceId,
    },
    select: {
      commission: {
        select: {
          commission_id: true,
        },
      },
    },
  });
  if (results == null) throw new NotFoundException(Entity.INVOICE);
  return results.commission.map((c) => c.commission_id);
};

export const getInvoiceExists = async (invoiceId: number, transactionClient: Prisma.TransactionClient = prisma) => {
  const invoice = await transactionClient.invoice.findFirst({
    where: {
      invoice_id: invoiceId,
    },
    select: {
      invoice_id: true,
    },
  });
  return !!invoice;
};

export const createInvoice = async (invoice: Prisma.invoiceCreateInput, commission: commission[]) => {
  invoice.invoiceNumber = await generateInvoiceNumber();
  const commissionsIds =
    commission.length > 0
      ? commission.map((value) => ({
          commission_id: value.commission_id,
        }))
      : null;
  if (!invoice.constantSymbol) invoice.constantSymbol = '308';
  if (!invoice.paymentMethod || invoice.paymentMethod === '') invoice.paymentMethod = 'příkazem';
  if (!invoice.issueDate) invoice.issueDate = Date.now();
  if (!invoice.language || invoice.language === '') invoice.language = 'čeština';

  const createdInvoice = await performTransaction(async (transactionClient) => {
    const createInvoicePromise = transactionClient.invoice.create({
      data: {
        ...invoice,
        commission: {
          connect: commissionsIds != null ? commissionsIds : undefined,
        },
      },
      include: {
        commission: true,
      },
    });

    const commissionUpdatePromises = commission?.map(({ commission_id, vat }) => {
      if (vat === null) throw new Error('VAT cannot be null');
      return transactionClient.commission.update({
        where: { commission_id },
        data: {
          vat,
        },
      });
    });

    await Promise.all(commissionUpdatePromises);
    return await createInvoicePromise;
  });

  return createdInvoice;
};

export const findOneInvoice = async (invoice_id: number) => {
  const completeInvoice = await prisma.complete_invoice.findFirst({
    where: {
      invoice_id,
      deleted: false,
    },
  });
  if (completeInvoice === null) return null;
  return completeInvoice;
};

export const findInvoices = async (queryString: InvoiceQueryString, csv = false): Promise<AllInvoicesResponse> => {
  const validSortingFields = [
    'dueDate',
    'exported',
    'invoiceSent',
    'invoice_id',
    'issueDate',
    'pointDate',
    'invoiceNumber',
    'customer_company',
    'totalCommissions',
    'currency',
    'totalPrice',
    'paymentConfirmationDate',
  ];

  const validSearchFields = ['invoice_id', 'customer_company', 'currency', 'invoiceNumber', 'invoiceSent', 'exported'];

  const validFilterFields = {
    issueDate_gt: '"issueDate" >',
    issueDate_lt: '"issueDate" <',
    issueDate_gte: '"issueDate" >=',
    issueDate_lte: '"issueDate" <=',
    dueDate_gt: '"dueDate" >',
    dueDate_lt: '"dueDate" <',
    dueDate_gte: '"dueDate" >=',
    dueDate_lte: '"dueDate" <=',
    paymentConfirmationDate_gt: '"paymentConfirmationDate" >',
    paymentConfirmationDate_lt: '"paymentConfirmationDate" <',
    paymentConfirmationDate_gte: '"paymentConfirmationDate" >=',
    paymentConfirmationDate_lte: '"paymentConfirmationDate" <=',
    pointDate_gt: '"pointDate" >',
    pointDate_lt: '"pointDate" <',
    pointDate_gte: '"pointDate" >=',
    pointDate_lte: '"pointDate" <=',
    totalCommissions_gt: '"totalCommissions" >',
    totalCommissions_lt: '"totalCommissions" <',
    totalCommissions_gte: '"totalCommissions" >=',
    totalCommissions_lte: '"totalCommissions" <=',
    totalPrice_gt: '"totalPrice" >',
    totalPrice_lt: '"totalPrice" <',
    totalPrice_gte: '"totalPrice" >=',
    totalPrice_lte: '"totalPrice" <=',
  };

  const sortParams: { field: string; order: string } = {
    field: 'invoice_id',
    order: 'DESC',
  };
  const offset: number = queryString.offset ? parseInt(queryString.offset) : 0;
  const limit: number = queryString.limit ? parseInt(queryString.limit) : 40;
  let whereFilter = 'WHERE deleted = false';
  const values = [];
  let counter = 1;

  Object.keys(queryString).forEach((key) => {
    //start limit
    if (key.toLowerCase() == 'limit' || key.toLowerCase() == 'offset') return;
    //sort
    if (key.toLowerCase() == 'sort') {
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue === null || queryStringValue === undefined || typeof queryStringValue !== 'string') return;
      const [field, order] = queryStringValue.split(':');
      if (validSortingFields.includes(field)) {
        sortParams.field = field;
        if (order.toLowerCase() === 'asc') {
          sortParams.order = 'ASC';
        }
      }
      return;
    }
    // for CSV export
    if (key === 'selected') {
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue === null || queryStringValue === undefined || typeof queryStringValue !== 'string') return;
      const ids = queryStringValue.split(',');
      const query = `CAST (invoice_id AS TEXT) IN (${ids.map(() => `$${counter++}`)})`;
      values.push(...ids);
      whereFilter += ` AND ${query}`;
      return;
    }
    if (key === 'omit') {
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue === null || queryStringValue === undefined || typeof queryStringValue !== 'string') return;
      const ids = queryStringValue.split(',');
      const query = `CAST (invoice_id AS TEXT) NOT IN (${ids.map(() => `$${counter++}`)})`;
      values.push(...ids);
      whereFilter += ` AND ${query}`;
      return;
    }

    if (key === 'search') {
      const savedCounter = counter++;
      const query = `("customer_company" ILIKE $${savedCounter} OR 
      CAST("invoiceNumber" AS TEXT) ILIKE $${savedCounter} OR 
      "currency" ILIKE $${savedCounter} OR 
      CAST("invoice_id" AS TEXT) ILIKE $${savedCounter})`;
      values.push(`%${queryString[key]}%`);
      whereFilter += ` AND ${query}`;
      return;
    }
    if (validSearchFields.includes(key)) {
      let query = '';
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue === null || queryStringValue === undefined) return;
      if (key == 'invoiceSent' || key == 'exported') {
        query = queryStringValue == 'true' ? `"${key}"` : `NOT "${key}"`;
      } else {
        query = `UPPER(CAST("${key}" AS TEXT)) LIKE UPPER($${counter++})`;
        values.push(`%${queryStringValue}%`);
      }
      whereFilter += ` AND ${query}`;
      return;
    }
    if (validFilterFields.hasOwnProperty(key)) {
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue === null || queryStringValue === undefined) return;
      const query = `${queryStringValue} $${counter++}`;
      values.push(Number(queryStringValue));
      whereFilter += ` AND ${query}`;
    }
  });
  values.push(limit, offset);

  const transactions = await prisma.$transaction([
    findManyInvoices({ whereFilter, sortParams, values }, csv),
    countFoundInvoices({ whereFilter, values }),
  ]);
  const invoices = transactions[0] as complete_invoice[];
  const totalRows = (transactions[1] as any)[0].totalRows;

  const response: AllInvoicesResponse = {
    data: invoices,
    totalRows,
  };

  return response;
};

export const removeInvoice = async (invoice_id: number) => {
  const invoiceToRemove = await prisma.invoice.findFirst({
    where: { invoice_id },
  });
  if (invoiceToRemove == null) return null;
  if (invoiceToRemove.deleted == true) {
    const error = {
      error_code: 404,
      message: 'Požadovaná faktura byla již smazána',
    };
    throw error;
  }

  const deleteInvoiceIds = prisma.commission.updateMany({
    where: { invoice_id },
    data: {
      invoice_id: null,
    },
  });
  const removedInvoice = prisma.invoice.update({
    where: { invoice_id },
    data: {
      deleted: true,
    },
  });
  const result = await prisma.$transaction([deleteInvoiceIds, removedInvoice]);

  return result[1];
};

const sqlFormatDate = (field: string) => {
  return `to_char(DATE (to_timestamp("${field}" / 1000 + 7200)::date), 'DD.MM.YYYY') as "${field}"`;
};

const csvSelect = `
    ${sqlFormatDate('issueDate')},
    ${sqlFormatDate('dueDate')},
    ${sqlFormatDate('pointDate')},
`;
const nonCsvSelect = `
      "issueDate",
      "dueDate",
      "pointDate",
`;

// separate function so it can be called in transaction
export const findManyInvoices = (filters?: any, csv?: boolean) => {
  const { whereFilter, sortParams, values } = filters;
  return prisma.$queryRawUnsafe(
    `SELECT 
      invoice_id,
      "invoiceNumber",
      ${csv ? csvSelect : nonCsvSelect}
      "invoiceSent",
      exported,
      deleted,
      customer_id,
      customer_company,
      currency,
      "totalCommissions",
      "paymentConfirmationDate",
      "totalPrice",
      "valueAddedTax",
      commission
    FROM complete_invoice
    ${whereFilter} 
    ORDER BY "${sortParams.field}" ${sortParams.order} NULLS LAST
    LIMIT $${values.length - 1} OFFSET $${values.length};
  `,
    ...values,
  );
};

export const countFoundInvoices = (filters?: any) => {
  const { whereFilter, values } = filters;
  return prisma.$queryRawUnsafe(
    `SELECT count(*)::int AS "totalRows" FROM complete_invoice
    ${whereFilter}`,
    ...values,
  );
};

export const createXml = async (ids: number[]) => {
  const MAX_RETRIES = 5;
  let retries = 0;

  const qapline = getQaplineDetails();
  while (retries < MAX_RETRIES) {
    const root = create({ version: '1.0' }).ele('dat:dataPack', {
      ...dataPackParams,
      ico: qapline.ico,
    });
    try {
      await prisma.$transaction(
        async (transaction) => {
          const invoices = await transaction.complete_invoice.findMany({
            where: {
              invoice_id: { in: ids },
              exported: { equals: false },
            },
          });
          if (invoices.length === 0) throw new Error('No data to export');
          const invoiceNumbers = invoices.map((invoice) => (invoice?.invoiceNumber || '').toString()).join(',');
          root.att(
            'note',
            `Uživatelský export ${
              invoiceNumbers.length > 50 ? `${invoiceNumbers.substring(0, 50)}...` : invoiceNumbers
            }`,
          );

          const euCountries = await transaction.state.findMany({
            where: {
              inEU: true,
            },
          });

          for (const invoice of invoices) {
            const customer = await transaction.customer.findFirst({
              where: { customer_id: invoice.customer_id || undefined },
            });
            if (customer === null) throw new NotFoundException(Entity.CUSTOMER);

            if (invoice.currency === null) throw new Error('Invoice currency cannot be null');
            if (invoice.invoiceNumber === null) throw new Error('Invoice number cannot be null');

            const accountDetails = parseAccount(invoice.currency);
            const paymentType = getPaymentType();

            const { orderDate, priceNone, priceHigh, priceVatHigh } = getCommissionValues(
              invoice.commission as unknown[],
            );

            const rounding =
              invoice.currency === 'EUR'
                ? Math.ceil(priceNone + priceHigh + priceVatHigh) - (priceNone + priceHigh + priceVatHigh)
                : 0;

            const totalPrice = priceNone + priceHigh + priceVatHigh + rounding;

            const exchangeRate = await getRate(String(invoice.pointDate), invoice.currency);

            const itemRoot = root
              .ele('dat:dataPackItem', {
                ...dataPackItemParams,
                id: invoice.invoiceNumber.toString(),
              })
              .ele('inv:invoice', {
                ...invoiceParams,
              })
              .ele('inv:invoiceHeader', { ...invoiceHeaderParams })
              .up()
              .ele('inv:invoiceDetail', { ...invoiceDetailParams })
              .up()
              .ele('inv:invoiceSummary', { ...invoiceSummaryParams })
              .up();

            const invHeader = itemRoot.first();
            const invDetail = invHeader.next();
            const invSummary = invDetail.next();

            invHeader.ele('inv:invoiceType').txt('issuedInvoice');
            invHeader.ele('inv:number').ele('typ:numberRequested').txt(String(invoice.invoiceNumber));
            invHeader.ele('inv:symVar').txt(String(invoice.invoiceNumber));
            invHeader.ele('inv:date').txt(parseDate(String(invoice.issueDate)));
            invHeader.ele('inv:dateTax').txt(parseDate(String(invoice.pointDate)));
            invHeader.ele('inv:dateAccounting').txt(parseDate(String(invoice.pointDate)));
            invHeader.ele('inv:dateDue').txt(parseDate(String(invoice.dueDate)));
            invHeader
              .ele('inv:accounting')
              .ele('typ:ids')
              .txt(`${customer.countryCode === 'CZ' ? '602100' : '602100zahr'}`);
            invHeader
              .ele('inv:classificationVAT')
              .ele('typ:ids')
              .txt(getClassificationVAT(customer.countryCode as string, euCountries));
            invHeader.ele('inv:text').txt('Fakturujeme Vám následující přepravy:');
            invHeader
              .ele('inv:partnerIdentity')
              .ele('typ:address')
              .ele('typ:company')
              .txt(customer.name)
              .up()
              .ele('typ:city')
              .txt(customer.city as string)
              .up()
              .ele('typ:street')
              .txt(customer.street as string)
              .up()
              .ele('typ:zip')
              .txt(customer.postalCode as string)
              .up()
              .ele('typ:ico')
              .txt(String(customer.companyRegistrationNumber))
              .up()
              .ele('typ:dic')
              .txt(customer.taxId as string);
            invHeader
              .ele('inv:myIdentity')
              .ele('typ:address')
              .ele('typ:company')
              .txt(qapline.company)
              .up()
              .ele('typ:surname')
              .txt(qapline.surname)
              .up()
              .ele('typ:name')
              .txt(qapline.name)
              .up()
              .ele('typ:city')
              .txt(qapline.city)
              .up()
              .ele('typ:street')
              .txt(qapline.street)
              .up()
              .ele('typ:number')
              .txt(qapline.number)
              .up()
              .ele('typ:zip')
              .txt(qapline.zip)
              .up()
              .ele('typ:ico')
              .txt(qapline.ico)
              .up()
              .ele('typ:dic')
              .txt(qapline.dic)
              .up()
              .ele('typ:mobilPhone')
              .txt(qapline.phone)
              .up()
              .ele('typ:email')
              .txt(qapline.email)
              .up();
            invHeader.ele('inv:dateOrder').txt(parseDate(String(orderDate)));
            invHeader
              .ele('inv:paymentType')
              .ele('typ:ids')
              .txt(paymentType.ids)
              .up()
              .ele('typ:paymentType')
              .txt(paymentType.type);
            invHeader
              .ele('inv:account')
              .ele('typ:ids')
              .txt(accountDetails.ids)
              .up()
              .ele('typ:accountNo')
              .txt(accountDetails.no)
              .up()
              .ele('typ:bankCode')
              .txt(accountDetails.code);
            invHeader.ele('inv:symConst').txt(accountDetails.symConst);
            const liq = invHeader
              .ele('inv:liquidation')
              .ele('typ:amountHome')
              .txt(String((totalPrice * exchangeRate).toFixed(2)))
              .up();

            if (invoice.currency === 'EUR') liq.ele('typ:amountForeign').txt(String(totalPrice.toFixed(2)));

            const commissions: any[] = invoice.commission as unknown[];
            commissions.forEach((item) => {
              const prices = calcPrices(item.priceCustomer, item.vat);

              const invItem = invDetail
                .ele('inv:invoiceItem')
                .ele('inv:text')
                .txt(item.qid)
                .up()
                .ele('inv:quantity')
                .txt('1')
                .up()
                .ele('inv:rateVAT')
                .txt(parseVatRate(item.vat))
                .up()
                .ele('inv:homeCurrency')
                .ele('typ:unitPrice')
                .txt(String((prices.price * exchangeRate).toFixed(2)))
                .up()
                .ele('typ:price')
                .txt(String((prices.price * exchangeRate).toFixed(2)))
                .up()
                .ele('typ:priceVAT')
                .txt(String((prices.priceVat * exchangeRate).toFixed(2)))
                .up()
                .ele('typ:priceSum')
                .txt(String((prices.priceSum * exchangeRate).toFixed(2)))
                .up()
                .up()
                .ele('inv:classificationVAT')
                .ele('typ:ids')
                .txt(getClassificationVAT(customer.countryCode as string, euCountries, prices.priceVat === 0))
                .up()
                .up()
                .ele('inv:PDP')
                .txt(`${prices.priceVat === 0 ? true : false}`)
                .up();

              if (invoice.currency === 'EUR')
                invItem
                  .ele('inv:foreignCurrency')
                  .ele('typ:unitPrice')
                  .txt(String(prices.price.toFixed(2)))
                  .up()
                  .ele('typ:price')
                  .txt(String(prices.price.toFixed(2)))
                  .up()
                  .ele('typ:priceVAT')
                  .txt(String(prices.priceVat.toFixed(2)))
                  .up()
                  .ele('typ:priceSum')
                  .txt(String(prices.priceSum.toFixed(2)));
            });

            invSummary
              .ele('inv:homeCurrency')
              .ele('typ:priceNone')
              .txt(String((priceNone * exchangeRate).toFixed(2)))
              .up()
              .ele('typ:priceHigh')
              .txt(String((priceHigh * exchangeRate).toFixed(2)))
              .up()
              .ele('typ:priceHighVAT')
              .txt(String((priceVatHigh * exchangeRate).toFixed(2)))
              .up()
              .ele('typ:priceHighSum')
              .txt(String(((priceHigh + priceVatHigh) * exchangeRate).toFixed(2)))
              .up()
              .ele('typ:round')
              .ele('typ:priceRound')
              .txt(String((rounding * exchangeRate).toFixed(2)));
            if (invoice.currency === 'EUR')
              invSummary
                .ele('inv:foreignCurrency')
                .ele('typ:currency')
                .ele('typ:ids')
                .txt('EUR')
                .up()
                .up()
                .ele('typ:rate')
                .txt(String(exchangeRate))
                .up()
                .ele('typ:amount')
                .txt('1')
                .up()
                .ele('typ:priceSum')
                .txt(String((priceNone + priceHigh + priceVatHigh).toFixed(2)))
                .up()
                .ele('typ:round')
                .ele('typ:priceRound')
                .txt(String(rounding.toFixed(2)));
          }

          await transaction.invoice.updateMany({
            where: {
              invoice_id: { in: ids },
              exported: { equals: false },
            },
            data: {
              exported: true,
            },
          });
        },
        {
          timeout: 60000,
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      return root.end();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === EPrismaClientErrorCodes.TransactionWriteConflict) {
          retries++;
          continue;
        }
      }
      throw error;
    }
  }
};

export const getPdf = async (
  file: string,
  footer?: string,
  header?: string,
  settings?: PdfPrintSettings,
): Promise<Buffer> => {
  const form = new FormData();
  form.append('files', file, 'index.html');

  footer && form.append('files', footer, 'footer.html');
  header && form.append('files', header, 'header.html');

  if (settings) {
    Object.entries(settings).forEach(([key, value]) => {
      form.append(key, value);
    });
  }

  form.append('files', fs.readFileSync('./resources/assets/logo.png'), 'logo.png');
  return await generatePdf(form, ProcessorType.HTML);
};

export const invoiceTemplate = async (data: any, lang: string) => {
  const loader = createFilesystemLoader(fs);
  const environment = createEnvironment(loader);

  environment.addFilter(createTransFilter(lang));
  environment.addFilter(createSourceTransFilter(lang));
  environment.addFilter(createFormatNumberFilter());
  environment.addFilter(createFormatDateFilter());

  const temp = await environment.loadTemplate('templates/invoice.twig');
  const tempFooter = await environment.loadTemplate('templates/invoice.footer.twig');
  const renderedFooter = await tempFooter.render(data);
  const renderedBody = await temp.render(data);
  return { body: renderedBody, footer: renderedFooter };
};

export const createSourceTransFilter = (lang: string) => {
  const filter = createFilter(
    'trans_source',
    (_executionContext, value) => {
      return Promise.resolve(
        (function () {
          if (i18next.exists(`invoicePdf.commission_source.${value}`)) {
            return t(`invoicePdf.commission_source.${value}`, lang);
          }
          return value;
        })(),
      );
    },
    [],
  );
  return filter;
};

export const createFormatNumberFilter = () => {
  const filter = createFilter(
    'format_number',
    (_executionContext, value) => {
      return Promise.resolve(
        Intl.NumberFormat('cs-CZ', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value),
      );
    },
    [],
  );
  return filter;
};

export const createTransFilter = (lang: string) => {
  const filter = createFilter(
    'trans',
    (_executionContext, value) => {
      return Promise.resolve(t(value, lang));
    },
    [],
  );
  return filter;
};

export const createFormatDateFilter = () => {
  const filter = createFilter(
    'format_date',
    (_executionContext, value) => {
      return Promise.resolve(
        moment
          .unix(Math.floor(Number(value) / 1000))
          .tz('Europe/Prague')
          .format('DD.MM.YYYY'),
      );
    },
    [],
  );
  return filter;
};

export const savePdfAttachment = async (
  invoice: complete_invoice,
  userId: number,
  language = 'cs',
): Promise<boolean> => {
  const languageCode = mapLang(language);
  try {
    const creator = await prisma.users.findFirst({
      where: { user_id: userId },
    });
    if (!creator) throw new NotFoundException(Entity.USER);

    if (invoice.customer_id === null) throw new Error('Invoice customer_id cannot be null');
    const customer = await prisma.customer.findUnique({
      where: { customer_id: invoice.customer_id },
    });
    if (customer === null) throw new NotFoundException(Entity.CUSTOMER);

    const commissions = [];
    let orderDate = Number.MAX_VALUE;

    for (const item of invoice.commission as any[]) {
      if (orderDate > Number(item.orderDate)) orderDate = Number(item.orderDate);
      commissions.push({
        text: `${item.qid} (${item.loading_city_string} -> ${item.discharge_city_string})`,
        orderedBy: item.orderSource || String(item.commissionNumber),
        orderDate: formatDate(item.orderDate),
        loadingDate: formatDate(item.loading_date[0]),
        price: item.priceCustomer,
        vat: Number(item.vat),
      });
    }

    const pdfInvoice = {
      createdBy: `${creator.name} ${creator.surname}`,
      createdByMail: creator.email,
      customerCompany: customer.name,
      customerStreet: customer.street,
      customerCountry: customer.country,
      customerPostalCode: customer.postalCode,
      customerCity: customer.city,
      registrationNumber: String(customer.companyRegistrationNumber),
      currency: invoice.currency,
      taxId: customer.taxId,
      paymentMethod: invoice.paymentMethod,
      language: mapLang(invoice.language as string),
      rateBase: await getRate(String(invoice.pointDate), invoice.currency as string),
      varSymbol: String(invoice.invoiceNumber),
      constSymbol: invoice.constantSymbol,
      orderDate: formatDate(orderDate),
      exposureDate: formatDate(invoice.issueDate as bigint),
      maturityDate: formatDate(invoice.dueDate as bigint),
      performanceDate: formatDate(invoice.pointDate as bigint),
      commissions,
    };
    const substitutions = await getSubstitutions(pdfInvoice as PdfInvoice);
    const { body, footer } = await invoiceTemplate(substitutions, languageCode);

    const pdf = await getPdf(body, footer);

    const fileName = randomUUID();

    await performTransaction(async (transactionClient) => {
      return await attachmentsService.createOrReplaceInvoiceAttachment(
        {
          name: `${invoice.invoiceNumber}.pdf`,
          type: EAttachmentType.INVOICE,
          userId: userId,
          invoiceId: invoice.invoice_id,
          file: {
            filename: fileName,
            mimetype: 'application/pdf',
            originalname: `${invoice.invoiceNumber}.pdf`,
            buffer: pdf,
            size: pdf.length,
          },
        },
        transactionClient,
      );
    }, ATTACH_OR_REPLACE_INVOICE_TRANSACTION_TIMEOUT);

    return true;
  } catch (_) {
    return false;
  }
};

export const listInvoiceNumbers = async (search?: string) => {
  const results: Pick<invoice, 'invoice_id' | 'invoiceNumber'>[] = await prisma.$queryRawUnsafe(
    `
    SELECT 
      "invoiceNumber",
      invoice_id
    FROM 
      invoice
    WHERE
      deleted = false
      AND "invoiceNumber" IS NOT NULL
      ${search ? `AND "invoiceNumber"::text ILIKE $1` : ''}
    ORDER BY
      "invoiceNumber" DESC
    ;`,
    ...(search ? [`%${search}%`] : []),
  );
  return results;
};

export * from './commissionsInvoicing/commissionsInvoicing.service';
export * from './invoicePayments/invoicePayments.service';
export * from './mailInvoice/mailInvoice.service';
export * from './invoicePaymentReminder/invoicePaymentReminder.service';
export * from './updateInvoice/updateInvoice.service';
