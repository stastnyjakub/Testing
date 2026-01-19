import {
  TCreateCustomerContactRequestBody,
  TUpdateCustomerContactRequestBody,
} from '../customerContact/customerContact.types';
import { TCreateLocationRequestBody, TUpdateLocationRequestBody } from '../location/location.types';

export type TUpdateCustomerRequestBody = {
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
  note?: string;
  sameBillingAddress?: boolean;
  cityBilling?: string;
  countryCodeBilling?: string;
  postalCodeBilling?: string;
  streetBilling?: string;

  customerContacts?: (
    | TCreateCustomerContactRequestBody
    | (TUpdateCustomerContactRequestBody & {
        customerContactId: number;
      })
  )[];

  locations?: (
    | TCreateLocationRequestBody
    | (TUpdateLocationRequestBody & {
        locationId: number;
      })
  )[];
};
