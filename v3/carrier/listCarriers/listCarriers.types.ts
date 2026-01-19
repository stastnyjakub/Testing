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

export type TListCarriersRequestBody = {
  limit?: number;
  offset?: number;
  search?: string;

  deleted?: boolean;
  company?: TStringFilter;
  companyRegistrationNumber?: TStringFilter;
  taxId?: TStringFilter;
  street?: TStringFilter;
  city?: TStringFilter;
  country?: TStringFilter;
  countryCode?: TStringFilter;
  postalCode?: TStringFilter;
  number?: TNumberFilter;
  tsEdited?: TNumberFilter;
  tsAdded?: TNumberFilter;
};
