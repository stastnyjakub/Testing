import * as Sentry from '@sentry/node';

import { Entity, NotFoundException } from '@/errors';
import { NumericIdRecord } from '@/types';
import { performTransaction } from '@/utils';

import {
  TCreateCustomerContactRequestBody,
  TUpdateCustomerContactRequestBody,
} from '../customerContact/customerContact.types';
import { getCustomer } from '../getCustomer/getCustomer.service';
import { TCreateLocationRequestBody, TUpdateLocationRequestBody } from '../location/location.types';
import { deleteProfilePictureByFileName } from '../profilePicture/profilePicture.service';

import { updateCustomerContacts } from './updateCustomerContacts';
import { updateLocations } from './updateLocations';

export type TUpdateCustomerArgs = {
  customerId: number;
  defaultDueDate?: number;
  city?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
  street?: string;
  name?: string;
  taxId?: string;
  companyRegistrationNumber?: string;
  billingEmail?: string;
  profilePicture?: string;
  note?: string;
  sameBillingAddress?: boolean;
  cityBilling?: string;
  countryCodeBilling?: string;
  postalCodeBilling?: string;
  streetBilling?: string;

  customerContacts?: (
    | TCreateCustomerContactRequestBody
    | (TUpdateCustomerContactRequestBody & NumericIdRecord<'customerContactId'>)
  )[];

  locations?: (TCreateLocationRequestBody | (TUpdateLocationRequestBody & NumericIdRecord<'locationId'>))[];
};
export const updateCustomer = async ({ customerId, customerContacts, locations, ...args }: TUpdateCustomerArgs) => {
  const customerOld = await getCustomer({ customerId });
  if (!customerOld) throw new NotFoundException(Entity.CUSTOMER);

  const updatedCustomer = await performTransaction(async (transactionClient) => {
    const updatedCustomer = await transactionClient.customer.update({
      where: { customer_id: customerId },
      data: {
        ...args,
      },
      include: { customerContacts: true, location: true },
    });

    if (customerContacts && customerContacts.length > 0) {
      await updateCustomerContacts(
        {
          customer: updatedCustomer,
          customerContacts,
        },
        transactionClient,
      );
    }
    if (locations) {
      await updateLocations(
        {
          customer: updatedCustomer,
          locations,
        },
        transactionClient,
      );
    }

    return updatedCustomer;
  });

  const oldProfilePicture = customerOld.profilePicture;
  if (args.profilePicture && oldProfilePicture && oldProfilePicture !== args.profilePicture) {
    try {
      await deleteProfilePictureByFileName(oldProfilePicture);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          customerId,
          oldProfilePicture,
          newProfilePicture: args.profilePicture,
        },
      });
    }
  }

  return updatedCustomer;
};
