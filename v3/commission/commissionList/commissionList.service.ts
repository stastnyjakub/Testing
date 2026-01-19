import { CustomerQueryString } from 'v3/customer/customer.interface';

import { AllCommissions } from '@/commission/commission.interface';
import prisma from '@/db/client';

import { CommissionExtended } from './commissionList.types';
import { convertTimestampsToDates } from './commissionList.utils';

const nonCsvSelect = `
    "loading_date",
    "loading_city",
    "loading_zip",
    "discharge_date",
    "discharge_city",
    "discharge_zip",
`;

export const getCommissionsFilter = (queryString: CustomerQueryString) => {
  const validSortingFields = [
    'commission_id',
    'week',
    'number',
    'state',
    'year',
    'loading_date',
    'loading_zip',
    'discharge_zip',
    'discharge_date',
    'total_weight',
    'total_loading_meters',
    'priceCustomer',
    'invNumber',
    'invoiceAttachment',
    'priceCarrier',
    'provision',
    'enquiryState',
    'addedBy',
    'carrierAssignedBy',
  ];
  const validSearchFields = [
    'state',
    'relation',
    'number',
    'customer_company',
    'loading_city',
    'loading_zip',
    'discharge_city',
    'discharge_zip',
    'carrier_company',
    'addedBy',
    'carrierAssignedBy',
    'notification',
    'note',
  ];
  const validFilterFields = {
    week_gte: '"week" >=',
    week_lte: '"week" <=',
    week: '"week" =',
    number_gte: '"number" >=',
    number_lte: '"number" <=',
    year_gte: '"year" >=',
    year_lte: '"year" <=',
    loading_date_gte: '"loading_date"[1] >=',
    loading_date_lte: '"loading_date"[1] <=',
    discharge_date_gte: '"discharge_date"[1] >=',
    discharge_date_lte: '"discharge_date"[1] <=',
    total_weight_gte: '"total_weight" >=',
    total_weight_lte: '"total_weight" <=',
    total_loading_meters_gte: '"total_loading_meters" >=',
    total_loading_meters_lte: '"total_loading_meters" <=',
    total_loading_meters: '"total_loading_meters" =',
    invoiceAttachment: `COALESCE("invoiceAttachment" ->> 'name', '') ILIKE`,
    customerPrice_gte: '"priceCustomer" >=',
    customerPrice_lte: '"priceCustomer" <=',
    invNumber_gte: '"invNumber" >=',
    invNumber_lte: '"invNumber" <=',
    carrierPrice_gte: '"priceCarrier" >=',
    carrierPrice_lte: '"priceCarrier" <=',
    priceCarrier_gte: '"priceCarrier" >=',
    priceCarrier_lte: '"priceCarrier" <=',
    priceCustomer_gte: '"priceCustomer" >=',
    priceCustomer_lte: '"priceCustomer" <=',
    provision_gte: '"provision" >=',
    provision_lte: '"provision" <=',
    enquiryState: '"enquiryState"::text =',
    state: '"state"::text =',
  };
  const sortParams = {
    mandatory: `notification DESC`,
    field: 'commission_id',
    select: '',
    order: 'DESC NULLS LAST',
  };

  const targetItemsIds = queryString.items?.split(',');
  const offset: number = queryString.offset ? parseInt(queryString.offset) : 0;
  const limit: number = queryString.limit ? parseInt(queryString.limit) : 40;
  let whereFilter = 'WHERE deleted = false';
  const values: any[] = [];
  let counter = 1;

  Object.keys(queryString).forEach((key) => {
    if (key === 'items' && targetItemsIds !== undefined) {
      let idsArr = '(';
      targetItemsIds.forEach((itemId, index) => {
        idsArr += targetItemsIds.length - 1 === index ? `${itemId})` : `${itemId}, `;
      });
      whereFilter += ` AND commission_id IN ${idsArr}`;
    }
    if (key === 'sort') {
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue !== undefined && typeof queryStringValue === 'string') {
        const [field, order] = queryStringValue.split(':');
        if (validSortingFields.includes(field)) {
          sortParams.field = field;
          if (field === 'invoiceAttachment') {
            sortParams.select = "->> 'name'";
          }
          if (order.toLowerCase() === 'asc') {
            sortParams.order = 'ASC NULLS LAST';
          }
          if (field === 'number')
            sortParams.order = sortParams.order === 'ASC NULLS LAST' ? 'ASC NULLS FIRST' : 'DESC NULLS FIRST';
        }
      }
    }

    if (validSearchFields.includes(key) && queryString[key as keyof typeof queryString]) {
      let query = ``;

      query = `CAST("${key}" AS TEXT) ILIKE $${counter++}`;
      values.push(`%${queryString[key as keyof typeof queryString]}%`);
      whereFilter += ` AND ${query}`;
    }

    // for CSV export
    if (key === 'selected') {
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue !== undefined && typeof queryStringValue === 'string') {
        const ids = queryStringValue.split(',');
        const query = `CAST (invoice_id AS TEXT) IN (${ids.map(() => `$${counter++}`)})`;
        values.push(...ids);
        whereFilter += ` AND ${query}`;
      }
    }
    if (key === 'omit') {
      const queryStringValue = queryString[key as keyof typeof queryString];
      if (queryStringValue !== undefined && typeof queryStringValue === 'string') {
        const ids = queryStringValue.split(',');
        const query = `CAST (invoice_id AS TEXT) NOT IN (${ids.map(() => `$${counter++}`)})`;
        values.push(...ids);
        whereFilter += ` AND ${query}`;
      }
    }

    if (key === 'search') {
      const savedCounter = counter++;
      let query = '';
      validSearchFields.forEach((searchField, idx) => {
        if (idx !== 0) query += ' OR ';
        query += `"${searchField}"::TEXT ILIKE $${savedCounter}`;
      });
      values.push(`%${queryString[key]}%`);
      whereFilter += ` AND (${query})`;
    }
    if (validFilterFields.hasOwnProperty(key)) {
      const filterFieldValue = validFilterFields[key as keyof typeof validFilterFields];
      const query = `${filterFieldValue} $${counter++}`;
      if (filterFieldValue.includes('ILIKE')) {
        values.push(`%${filterFieldValue}%`);
      } else if (key === 'enquiryState') {
        values.push(`${filterFieldValue}`);
      } else if (key === 'state') {
        values.push(`${filterFieldValue}`);
      } else {
        values.push(Number(filterFieldValue));
      }
      whereFilter += ` AND ${query}`;
    }
  });
  values.push(limit, offset);

  return { whereFilter, values, sortParams, counter };
};

export const findManyCommissions = (filters?: any, csv?: boolean) => {
  const { whereFilter, sortParams, values } = filters;
  const query = `SELECT
      "commission_id",
      "state",
      "relation",
      "week",
      "number",
      "year",
      "customer_company",
      ${csv ? nonCsvSelect : nonCsvSelect}
      "total_weight",
      "total_loading_meters",
      "priceCustomer",
      "invNumber",
      "addedBy",
      "carrierAssignedBy",
      "carrier_company",
      "priceCarrier",
      "provision",
      "notification",
      "qid",
      "note",
      "customer_id",
      "carrier_id",
      "invoice_id",
      "currencyCarrier",
      "carrierOrderSent",
      "orderConfirmationSent",
      "loadingConfirmationSent",
      "dischargeConfirmationSent",
      "oldid",
      "enquiry_id",
      "enquiryState",
      "priceEstimation",
      "invoiceAttachment"
      FROM complete_commission
      ${whereFilter} 
      ORDER BY ${sortParams.mandatory}, "${sortParams.field}"${sortParams.select ? sortParams.select : ''} ${sortParams.order}
      LIMIT $${values.length - 1} OFFSET $${values.length};
    `;
  return prisma.$queryRawUnsafe(query, ...values);
};

export const countFoundCommissions = (filters?: any) => {
  const { whereFilter, values } = filters;
  return prisma.$queryRawUnsafe(
    `SELECT count(*)::int AS "totalRows" FROM complete_commission
      ${whereFilter}`,
    ...values,
  );
};

export const getCommissions = async (queryString: CustomerQueryString, csv = false): Promise<AllCommissions> => {
  const { whereFilter, values, sortParams, counter } = getCommissionsFilter(queryString);
  const transaction = await prisma.$transaction([
    findManyCommissions({ whereFilter, values, sortParams, counter }, csv),
    countFoundCommissions({ whereFilter, values }),
  ]);
  const foundCommissions = transaction[0] as CommissionExtended[];
  const totalRows = (transaction[1] as any[])[0].totalRows;
  const foundCommissionsTransformed = convertTimestampsToDates(foundCommissions);
  return {
    data: foundCommissionsTransformed as any,
    totalRows,
  };
};
