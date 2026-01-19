import { Nullable } from '@/types';

export type TProcessCustomerRegistrationRequestRequestBody = {
  email: string;
  password: string;
  companyIdentification: string;
};

export type TRegisterCustomerRequestBody = {
  company: {
    name: string;
    taxId: string;
    countryCode: string;
    street: string;
    postalCode: string;
    city: string;
    sameBillingAddress: boolean;
    cityBilling: string;
    countryCodeBilling: string;
    postalCodeBilling: string;
    streetBilling: string;
    billingEmail: string;
  };
  user: {
    name: string;
    surname: string;
    phone?: Nullable<string>;
  };
};
