import prisma from '@/db/client';

import { CustomerQueryString } from '../../customer/customer.interface';
import { getCommissionsFilter } from '../commission.service';

// This is the user ids that can get the commissions summary
//? 1 -> jindra.machan@qapline.com, 4 –> jindrich.machan@qapline.com
export const CAN_GET_COMMISSIONS_SUMMARY_USER_IDS = [1, 4];

export type TGetCommissionsSummaryResult = {
  totalPriceCarrier: number;
  totalPriceCustomer: number;
  totalProvision: number;
};

export const getCommissionsSummary = async (
  queryString: CustomerQueryString,
): Promise<TGetCommissionsSummaryResult> => {
  const { values, whereFilter } = getCommissionsFilter(queryString);
  const query = `
    SELECT
        SUM("priceCustomer") AS "totalPriceCustomer",
        SUM("priceCarrier") AS "totalPriceCarrier",
        SUM("provision") AS "totalProvision"
    FROM 
        complete_commission
    ${whereFilter};
  `;
  const queryResult = (await prisma.$queryRawUnsafe(query, ...values)) as TGetCommissionsSummaryResult[];
  const { totalPriceCarrier, totalPriceCustomer, totalProvision } = queryResult[0];

  return {
    totalPriceCarrier: Math.ceil(Number(totalPriceCarrier)),
    totalPriceCustomer: Math.ceil(Number(totalPriceCustomer)),
    totalProvision: Math.ceil(Number(totalProvision)),
  };
};
