import { Prisma } from '@prisma/client';
import moment from 'moment';

import { performTransaction } from '@/utils';

import * as customerContactService from '../customerContact/customerContact.service';
import { TCreateCustomerContactRequestBody } from '../customerContact/customerContact.types';
import * as customerUserService from '../customerUser/customerUser.service';
import { TCreateCustomerUserRequestBody } from '../customerUser/types';
import * as locationService from '../location/location.service';
import { TCreateLocationRequestBody } from '../location/location.types';

export type TCreateCustomerArgs = {
  city: string;
  countryCode: string;
  postalCode: string;
  street: string;
  name: string;
  taxId: string;
  companyRegistrationNumber: string;
  billingEmail: string;
  sameBillingAddress: boolean;
  cityBilling: string;
  countryCodeBilling: string;
  postalCodeBilling: string;
  streetBilling: string;
  profilePicture?: string;
  defaultDueDate?: number;
  note?: string;
  addedById?: number;

  customerContacts?: TCreateCustomerContactRequestBody[];
  locations?: TCreateLocationRequestBody[];
  users?: (TCreateCustomerUserRequestBody & Pick<customerUserService.TCreateCustomerUserArgs, 'role'>)[];
};
export const createCustomer = async (
  {
    city,
    countryCode,
    postalCode,
    street,
    name,
    taxId,
    companyRegistrationNumber,
    billingEmail,
    sameBillingAddress,
    cityBilling,
    countryCodeBilling,
    postalCodeBilling,
    streetBilling,
    profilePicture,
    defaultDueDate,
    note,
    customerContacts,
    locations,
    users,
    addedById,
  }: TCreateCustomerArgs,
  transactionClient?: Prisma.TransactionClient,
) => {
  const transactionAction = async (transactionClient: Prisma.TransactionClient) => {
    const customer = await transactionClient.customer.create({
      data: {
        city,
        countryCode,
        postalCode,
        street,
        name,
        taxId,
        companyRegistrationNumber,
        billingEmail,
        sameBillingAddress,
        cityBilling,
        countryCodeBilling,
        postalCodeBilling,
        streetBilling,
        profilePicture,
        defaultDueDate,
        note,
        addedBy_id: addedById,
        tsAdded: moment().unix(),
      },
    });
    const { customer_id } = customer;

    const creationPromises: Promise<unknown>[] = [];

    if (locations?.length) {
      locations.forEach((data) => {
        creationPromises.push(locationService.createLocation({ ...data, customerId: customer_id }, transactionClient));
      });
    }

    if (customerContacts?.length) {
      customerContacts.forEach((data) => {
        creationPromises.push(
          customerContactService.createCustomerContact({ ...data, customerId: customer_id }, transactionClient),
        );
      });
    }

    if (users?.length) {
      users.forEach((data) => {
        creationPromises.push(
          customerUserService.createCustomerUser({ ...data, customerId: customer_id }, transactionClient),
        );
      });
    }

    await Promise.all(creationPromises);

    return customer;
  };

  const customer = transactionClient
    ? await transactionAction(transactionClient)
    : await performTransaction(transactionAction);

  return customer;
};
