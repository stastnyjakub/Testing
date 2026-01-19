import { commission } from '@prisma/client';

export interface CommissionExtended extends commission {
  discharge_date?: bigint[];
  loading_date?: bigint[];
}
