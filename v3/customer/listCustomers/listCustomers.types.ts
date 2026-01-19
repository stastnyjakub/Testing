type TStringFilter = {
  equals?: string;
  contains?: string;
};
type TNumberFilter = {
  equals?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
};

export type TListCustomersRequestQuery = {
  limit?: number;
  offset?: number;
  search?: string;

  name?: TStringFilter;
  number?: TNumberFilter;
  city?: TStringFilter;
  country?: TStringFilter;
  countryCode?: TStringFilter;
  postalCode?: TStringFilter;
  street?: TStringFilter;
  companyRegistrationNumber?: TStringFilter;
  taxId?: TStringFilter;
  note?: TStringFilter;
  billingEmail?: TStringFilter;
};
