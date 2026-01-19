import { Customer, CustomerContact, location, Prisma } from '@prisma/client';
export interface AllCustomers {
  data: Customer[];
  totalRows: number;
}

export enum ECustomerType {
  Potential = 'POTENTIAL',
  Active = 'ACTIVE',
}

export interface CustomerQueryString {
  customer_id?: number;
  sort?: string;
  limit?: string;
  offset?: string;
  number?: string;
  company?: string;
  street?: string;
  postalCode?: string;
  country?: string;
  note?: string;
  search?: string;
  omit?: string;
  type?: ECustomerType;
  city?: string;
  selected?: string;
  items?: string;
  countryCode?: string;
}

export interface CustomerFilters {
  whereFilter?: string;
  extendedWhereFilter?: string;
  values?: string[];
  counter?: number;
  sortParams?: {
    field: string;
    order: string;
  };
}

export interface CustomerBodyCreate extends Omit<Prisma.CustomerCreateInput, 'customerContacts' | 'locations'> {
  customerContacts: {
    toCreate: Prisma.CustomerContactCreateInput[];
  };
  locations: { toCreate: Prisma.locationCreateInput[] };
}

export interface CustomerBodyUpdate extends Omit<Prisma.CustomerUpdateInput, 'customerContacts' | 'locations'> {
  customerContacts: {
    toCreate: Prisma.CustomerContactCreateInput[];
    toUpdate: CustomerContact[];
    toDelete: { customerContact_id: number }[];
  };
  locations: {
    toCreate: Prisma.locationCreateInput[];
    toUpdate: location[];
    toDelete: { location_id: number }[];
  };
}
