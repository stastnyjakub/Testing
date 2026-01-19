import { Customer } from '@prisma/client';

import { ECustomerType } from './customer.interface';

export const getCustomerType = (customer: Customer) => {
  const requiredFields: (keyof Customer)[] = [
    'name',
    'country',
    'postalCode',
    'city',
    'street',
    'taxId',
    'billingEmail',
    'countryCode',
  ];
  const isComplete = requiredFields.every((field) => customer[field] !== null && customer[field] !== undefined);
  return isComplete ? ECustomerType.Active : ECustomerType.Potential;
};
