import _ from 'lodash';
import moment from 'moment';

import { EAttachmentType } from '@/attachment/types';
import { ECommissionState } from '@/commission/types';
import prisma from '@/db/client';
import { ECurrency } from '@/types';
import { ETimeUnit, getTimeInMs } from '@/utils';

import { TGetAllUnInvoicedCommissionsArgs, TGetCommissionsForInvoicingArgs, TGetInvoicingStatusesArgs } from '../types';

import { getCommissionsInvoicingSelect } from './commissionsInvoicing.utils';

/**
 * Get counts of commissions that are ready for invoicing and those which are un-invoiced.
 * Limit commissions to past year.
 */
export const getCommissionsInvoicingCounts = async () => {
  // Get counts only from past year
  const maxCommissionAge = getTimeInMs(1, ETimeUnit.Years);

  const commissionsForInvoicingCount = (await getInvoicingStatuses({ maxCommissionAge })).reduce((prev, curr) => {
    return prev + curr.czkCount + curr.eurCount;
  }, 0);
  const unInvoicedCommissionsCount = (
    await getInvoicingStatuses({ includeAllUnInvoicedCommissions: true, maxCommissionAge })
  ).reduce((prev, curr) => {
    return prev + curr.czkCount + curr.eurCount;
  }, 0);

  return {
    commissionsForInvoicingCount,
    unInvoicedCommissionsCount,
  };
};

/**
 * Get all commissions that are ready for invoicing
 * Commission is ready for invoicing if:
 * - It has a delivery note
 * - It is in state Complete
 * - It is not already invoiced
 * - It has a currency
 * - It has a customer
 */
export const getCommissionsForInvoicing = async ({
  currency,
  customerId,
  maxCommissionAge,
}: TGetCommissionsForInvoicingArgs = {}) => {
  // Order date is in milliseconds so we need to multiply by 1000
  const minOrderDate = maxCommissionAge ? moment().subtract(maxCommissionAge, 'milliseconds').unix() * 1000 : undefined;

  const preparedCommissions = await prisma.commission.findMany({
    select: getCommissionsInvoicingSelect(),
    where: {
      orderDate: {
        gte: minOrderDate,
      },
      state: ECommissionState.Complete,
      invoice_id: null,
      // If currency is not provided, we do not want empty currency
      currencyCustomer: currency || { not: null },
      customer_id: customerId || { not: null },
      attachments: {
        some: {
          type: EAttachmentType.DELIVERY_NOTE,
        },
      },
      deleted: false,
    },
  });
  return preparedCommissions;
};

/**
 * Get all commissions that are un-invoiced
 * Commission is un-invoiced if:
 * - It is not already invoiced
 * - It is in state Complete or InComplete
 */
export const getAllUnInvoicedCommissions = async ({
  currency,
  customerId,
  maxCommissionAge,
}: TGetAllUnInvoicedCommissionsArgs = {}) => {
  // Order date is in milliseconds so we need to multiply by 1000
  const minOrderDate = maxCommissionAge ? moment().subtract(maxCommissionAge, 'milliseconds').unix() * 1000 : undefined;

  const unInvoicedCommissions = await prisma.commission.findMany({
    select: getCommissionsInvoicingSelect(),
    where: {
      invoice_id: null,
      currencyCustomer: currency || { not: null },
      customer_id: customerId || { not: null },
      orderDate: {
        gte: minOrderDate,
      },
      state: {
        // Do not include enquiry commissions
        in: [ECommissionState.Complete, ECommissionState.InComplete],
      },
      deleted: false,
    },
  });
  return unInvoicedCommissions;
};

export const getInvoicingStatuses = async ({
  includeAllUnInvoicedCommissions,
  maxCommissionAge,
}: TGetInvoicingStatusesArgs = {}) => {
  const unInvoicedCommissions = await (async () => {
    if (includeAllUnInvoicedCommissions) {
      return await getAllUnInvoicedCommissions({ maxCommissionAge });
    }
    return await getCommissionsForInvoicing({ maxCommissionAge });
  })();

  // Some commissions are missing customer, so we discard them
  const groupedByCustomer = _.groupBy(unInvoicedCommissions, ({ customer }) => customer?.customer_id || 'discarded');
  delete groupedByCustomer['discarded'];

  const invoicingCounts = Object.entries(groupedByCustomer).map(([customerId, commissions]) => {
    const result = {
      customerId: Number(customerId),
      customerCompany: commissions[0].customer?.name,
      czkCount: commissions.filter(({ currencyCustomer }) => currencyCustomer === ECurrency.CZK).length,
      eurCount: commissions.filter(({ currencyCustomer }) => currencyCustomer === ECurrency.EUR).length,
    };
    return result;
  });
  return invoicingCounts;
};
