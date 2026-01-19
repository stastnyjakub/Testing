import { Prisma } from '@prisma/client';

export type TCreateCustomerArgs = {
  customer: Prisma.CustomerCreateInput;
  customerContacts: Prisma.CustomerContactCreateInput[];
  locations: Omit<Prisma.locationCreateInput, 'customer'>[];
};
