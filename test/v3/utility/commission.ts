import { commission, Prisma } from '@prisma/client';
import prisma from '../../../v3/db/client';

export const createMockCommission = async (): Promise<commission> => {
  try {
    const data = <Prisma.commissionCreateInput>{
      addedBy: 'tomas.tran@koala42.com',
      priceCustomer: 100,
      currencyCustomer: 'CZK',
    };
    const commission = await prisma.commission.create({
      data,
    });
    return commission;
  } catch (e) {
    console.warn('Error', e.message);
  }
};

export const getMockCommission = async (commission: commission): Promise<commission> => {
  try {
    const oneCommission = await prisma.commission.findFirst({
      where: { commission_id: commission.commission_id },
    });
    return oneCommission;
  } catch (e) {
    console.warn('Error', e.message);
  }
};

export const deleteMockCommission = async (commission: commission) => {
  try {
    await prisma.commission.delete({
      where: {
        commission_id: commission.commission_id,
      },
    });
  } catch (e) {
    console.warn('Error', e.message);
  }
};
