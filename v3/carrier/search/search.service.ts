import prisma from '@/db/client';
import { HttpException } from '@/errors';

import { IGetCarrierListResponse } from '../carrier.interface';

const _csvSelect = `
, to_char(DATE (to_timestamp("c".ts_added / 1000 + 7200)::date), 'DD.MM.YYYY') as "ts_added"
`;

// export const getCarriers = async (queryString?: QueryString, csv = false): Promise<AllCarriersResponse> => {
//   const validSortingFields = [
//     'carrier_id',
//     'number',
//     'company',
//     'street',
//     'postalCode',
//     'dispatchersStates',
//     'city',
//     'country',
//     'phone',
//     'email',
//     'ts_added',
//     'ts_edited',
//     'note',
//   ];

//   const validSearchFields = [
//     'carrier_id',
//     'number',
//     'company',
//     'street',
//     'postalCode',
//     'countryCode',
//     'city',
//     'country',
//     'phone',
//     'email',
//     'note',
//   ];

//   const validFilterFields = {
//     ts_added_gt: 'ts_added >',
//     ts_added_lt: 'ts_added <',
//     ts_added_gte: 'ts_added >=',
//     ts_added_lte: 'ts_added <=',
//     ts_edited_gt: 'ts_edited >',
//     ts_edited_lt: 'ts_edited <',
//     ts_edited_gte: 'ts_edited >=',
//     ts_edited_lte: 'ts_edited <=',
//     number_gte: 'number >=',
//     number_lte: 'number <=',
//   };

//   const sortParams = {
//     field: 'carrier_id',
//     order: 'DESC',
//   };
//   const targetItemsIds = queryString.items?.split(',');
//   const offset: number = (queryString && parseInt(queryString.offset)) || 0;
//   const limit: number = (queryString && parseInt(queryString.limit)) || 40;
//   let whereFilter = '"c".deleted = false';
//   let dispatchersStateWhereFilter = '';
//   const values = [];
//   let counter = 1;

//   if (queryString) {
//     Object.keys(queryString).forEach((key) => {
//       if (key === 'after' || key === 'limit') return;
//       if (key === 'items') {
//         let idsArr = '(';
//         targetItemsIds.forEach((itemId, index) => {
//           idsArr += targetItemsIds.length - 1 === index ? `${itemId})` : `${itemId}, `;
//         });
//         whereFilter += ` AND "c".carrier_id IN ${idsArr}`;
//         return;
//       }
//       if (key === 'sort') {
//         const [field, order] = queryString[key].split(':');
//         if (validSortingFields.includes(field)) {
//           if (order.toLowerCase() === 'asc') {
//             sortParams.order = 'ASC';
//           }
//           if (field === 'dispatchersStates') {
//             sortParams.field = `dispatchersregistered ${sortParams.order}, "c".dispatcherspending ${sortParams.order}, "c".dispatchersunregistered`;
//           } else if (field === 'city' || field === 'country' || field === 'street' || field === 'postalCode')
//             sortParams.field = `place ->> '${field}'`;
//           else {
//             sortParams.field = field;
//           }
//         }
//         return;
//       }
//       // for CSV export
//       if (key === 'selected') {
//         const ids = queryString[key].split(',');
//         const query = `CAST ("c".carrier_id AS TEXT) IN (${ids.map(() => `$${counter++}`)})`;
//         values.push(...ids);
//         whereFilter += ` AND ${query}`;
//         return;
//       }
//       if (key === 'dispatchersStates') {
//         const statesToFilter: { registered: boolean; unregistered: boolean; pending: boolean } = JSON.parse(
//           queryString[key],
//         );
//         dispatchersStateWhereFilter += ` AND "c".dispatchersregistered >= ${statesToFilter.registered ? 1 : 0}`;
//         dispatchersStateWhereFilter += ` AND "c".dispatchersunregistered >= ${statesToFilter.unregistered ? 1 : 0}`;
//         dispatchersStateWhereFilter += ` AND "c".dispatcherspending >= ${statesToFilter.pending ? 1 : 0}`;
//         return;
//       }
//       if (key === 'omit') {
//         const ids = queryString[key].split(',');
//         const query = `CAST ("c".carrier_id AS TEXT) NOT IN (${ids.map(() => `$${counter++}`)})`;
//         values.push(...ids);
//         whereFilter += ` AND ${query}`;
//         return;
//       }
//       if (validFilterFields.hasOwnProperty(key)) {
//         const query = `${validFilterFields[key]} CAST($${counter++} AS NUMERIC)`;
//         values.push(Number(queryString[key]));
//         whereFilter += ` AND ${query}`;
//         return;
//       }
//       if (validSearchFields.includes(key)) {
//         let query: string;
//         if (key === 'street' || key === 'city' || key === 'country' || key === 'countryCode' || key === 'postalCode') {
//           const savedCounter = counter++;
//           query = `("c"."${key}" ILIKE $${savedCounter} OR "c".place ->> '${key}' ILIKE $${savedCounter})`;
//         } else {
//           query = `CAST("c"."${key}" AS TEXT) ILIKE $${counter++}`;
//         }
//         values.push(`%${queryString[key]}%`);
//         whereFilter += ` AND ${query}`;
//         return;
//       }
//       if (key === 'search') {
//         const fullTextCounter = counter++;
//         whereFilter += ` AND "c".DELETED = FALSE
//         AND (
//           CAST("c".CARRIER_ID AS TEXT) ILIKE $${fullTextCounter}
//           OR CAST("c".QID AS TEXT) ILIKE $${fullTextCounter}
//           OR CAST("c".NUMBER AS TEXT) ILIKE $${fullTextCounter}
//           OR "c".COMPANY ILIKE $${fullTextCounter}
//           OR "c".STREET ILIKE $${fullTextCounter}
//           OR "c"."postalCode" ILIKE $${fullTextCounter}
//           OR "c".CITY ILIKE $${fullTextCounter}
//           OR "c".COUNTRY ILIKE $${fullTextCounter}
//           OR "c".PHONE ILIKE $${fullTextCounter}
//           OR "c".EMAIL ILIKE $${fullTextCounter}
//           OR CAST("c".TS_ADDED AS TEXT) ILIKE $${fullTextCounter}
//           OR CAST("c".TS_EDITED AS TEXT) ILIKE $${fullTextCounter}
//           OR "c".NOTE ILIKE $${fullTextCounter}
//           OR "c".PLACE ->> 'city' ILIKE $${fullTextCounter}
//           OR "c".PLACE ->> 'country' ILIKE $${fullTextCounter}
//           OR "c".PLACE ->> 'postalCode' ILIKE $${fullTextCounter}
//           OR "c".PLACE ->> 'street' ILIKE $${fullTextCounter}
//           OR "c".PLACE ->> 'latitude' ILIKE $${fullTextCounter}
//           OR "c".PLACE ->> 'longitude' ILIKE $${fullTextCounter}
//           OR "c".PLACE ->> 'countryCode' ILIKE $${fullTextCounter}
//           OR "c"."countryCode" ILIKE $${fullTextCounter}
//           OR "c"."addedBy" ILIKE $${fullTextCounter}
//           OR "c"."editedBy" ILIKE $${fullTextCounter}
//           OR "c"."firstName" ILIKE $${fullTextCounter}
//           OR "c"."lastName" ILIKE $${fullTextCounter}
//           OR CAST("c"."companyRegistrationNumber" AS TEXT) ILIKE $${fullTextCounter}
//           OR CAST("d".DISPATCHER_ID AS TEXT) ILIKE $${fullTextCounter}
//           OR "d"."email" ILIKE $${fullTextCounter}
//           OR "d"."firstName" ILIKE $${fullTextCounter}
//           OR "d"."lastName" ILIKE $${fullTextCounter}
//           OR "d"."phone" ILIKE $${fullTextCounter}
//         )
//           `;
//         values.push(`%${queryString.search}%`);
//         return;
//       }
//     });
//   }
//   values.push(limit, offset);

//   const transaction = await prisma.$transaction([
//     findManyCarriers({ sortParams, whereFilter, values, counter, dispatchersStateWhereFilter }, csv),
//     countCarriers({ whereFilter, values, dispatchersStateWhereFilter }),
//   ]);

//   const carriers = transaction[0] as carrierWithOnboardingInfo[];
//   const totalRows = parseInt(transaction[1][0].count);
//   return {
//     data: carriers,
//     totalRows,
//   };
// };

// export const findManyCarriers = (filters?: Filters, csv?: boolean) => {
//   if (filters) {
//     const { sortParams, whereFilter, values, counter, dispatchersStateWhereFilter } = filters;
//     const query = `
//       SELECT * FROM (
//         SELECT DISTINCT on ("c".carrier_id)
//           "c".*${csv ? csvSelect : ''}
//         FROM
//           CARRIER_ONBOARDING AS "c"
//         LEFT JOIN
//           DISPATCHER as "d" ON d.CARRIER_ID = "c".CARRIER_ID
//         WHERE
//           ${whereFilter} ${dispatchersStateWhereFilter}
//         ORDER BY
//           "c".carrier_id, "c".${sortParams.field} ${sortParams.order} NULLS LAST
//       ) AS "c"
//       ORDER BY "c".${sortParams.field} ${sortParams.order} NULLS LAST LIMIT $${counter} OFFSET $${counter + 1};
//       `;
//     console.log(query);
//     return prisma.$queryRawUnsafe(query, ...values);
//   }
//   return prisma.carrier.findMany();
// };

// export const countCarriers = (filters?: Filters) => {
//   if (filters) {
//     const { whereFilter, values, dispatchersStateWhereFilter } = filters;
//     const query = `
//     SELECT
//       COUNT(*)
//     FROM
//       (
//         SELECT DISTINCT ON ("c".carrier_id) * FROM "carrier_onboarding" as "c"
//         LEFT JOIN DISPATCHER as "d" ON d.CARRIER_ID = "c".CARRIER_ID
//         WHERE ${whereFilter} ${dispatchersStateWhereFilter}
//       ) AS fo;`;
//     return prisma.$queryRawUnsafe(query, ...values);
//   }
//   return prisma.carrier.count();
// };

export const getCarrierList = async (): Promise<IGetCarrierListResponse> => {
  const carriers = await prisma.carrier.findMany({
    select: { company: true, carrier_id: true },
  });

  if (!carriers) {
    throw new HttpException(404, '"c".notFoundAll');
  }

  return {
    data: carriers,
    totalRows: carriers.length,
  };
};
