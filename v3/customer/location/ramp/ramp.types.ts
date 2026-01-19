export type TCreateRampRequestBody = {
  number: string;
  gatehousePhone?: string | null;
};

export type TUpdateRampRequestBody = {
  number?: string;
  gatehousePhone?: string | null;
};
