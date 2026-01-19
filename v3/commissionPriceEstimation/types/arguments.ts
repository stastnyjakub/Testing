import { CommissionPriceEstimation } from '@prisma/client';

export type TCreateCommissionPriceEstimationEntityArgs = Omit<
  CommissionPriceEstimation,
  'commissionPriceEstimation_id' | 'tsAdded' | 'customer' | 'commission' | 'customer_id' | 'commission_id' | 'code'
> & {
  customerId?: number;
  commissionId?: number;
};

export type TUpdateCommissionPriceEstimationEntityArgs = Partial<
  Omit<
    CommissionPriceEstimation,
    'commissionPriceEstimation_id' | 'tsAdded' | 'customer' | 'commission' | 'customer_id' | 'commission_id' | 'code'
  >
> & {
  commissionPriceEstimation_id?: number;
  code?: string;
  customerId?: number;
  commissionId?: number;
};

export type TGetCommissionPriceEstimationEntityArgs = {
  code?: string;
  id?: number;
};
