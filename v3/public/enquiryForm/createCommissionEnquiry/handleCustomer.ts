import { Prisma } from '@prisma/client';

import { ECustomerType } from '@/customer/customer.interface';
import * as customerService from '@/customer/customer.service';
import { TCreateCustomerArgs } from '@/customer/types/arguments';
import prisma from '@/db/client';

import { TEnquiryFormPoint } from '../types';

export type TGetOrCreateCustomerArgs = {
  email: string;
  phone?: string;
  startPoint: TEnquiryFormPoint;
  endPoint: TEnquiryFormPoint;
  transactionClient?: Prisma.TransactionClient;
};

//TODO: phone is not used, but it should be added to customer contacts in the future
export const getOrCreateCustomer = async ({
  email,
  endPoint,
  startPoint,
  phone: _phone,
  transactionClient = prisma,
}: TGetOrCreateCustomerArgs) => {
  const customerData: TCreateCustomerArgs['customer'] = {
    name: email,
    type: ECustomerType.Potential,
    billingEmail: email,
  };

  const loadingLocation: TCreateCustomerArgs['locations'][number] = {
    ...startPoint,
    loading: true,
    discharge: false,
  };

  const dischargeLocation: TCreateCustomerArgs['locations'][number] = {
    ...endPoint,
    discharge: true,
    loading: false,
  };

  const createdCustomer = await customerService.getOrCreateCustomerForEnquiry(
    {
      customer: customerData,
      locations: [loadingLocation, dischargeLocation],
      customerContacts: [],
    },
    transactionClient,
  );

  return createdCustomer;
};
