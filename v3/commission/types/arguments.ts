import { Prisma } from '@prisma/client';

import { ECurrency } from '@/types';

export type TListCommissionNumberArgs = {
  search?: string;
  age?: string;
};

export type TCreateCommissionArgs = {
  commission: Prisma.commissionUncheckedCreateInput;
  commissionDischarges: Prisma.commissiondischargeUncheckedCreateInput[];
  commissionLoadings: Prisma.commissionloadingUncheckedCreateInput[];
  commissionItems: Prisma.commissionitemUncheckedCreateInput[] &
    {
      dischargeIdx: number;
      loadingIdx: number;
    }[];
  userId?: number;
};

export type TCalculateCommissionPriceArgs =
  | {
      customerPrice: number;
      customerCurrency: ECurrency;
      exchangeRateCustomer?: number;
      vat: number;
    }
  | {
      customerPrice: number;
      customerCurrency: ECurrency;
      exchangeRateCustomer?: number;
      vat?: undefined;
    };

export type TCalculateCommissionCostsArgs = {
  carrierPrice: number;
  carrierCurrency: ECurrency;
  exchangeRateCarrier?: number;
};
