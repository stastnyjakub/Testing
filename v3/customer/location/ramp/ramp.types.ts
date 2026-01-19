export type TCreateRampRequestBody = {
  number: number;
  gatehousePhone?: string | null;
};

export type TUpdateRampRequestBody = {
  number?: number;
  gatehousePhone?: string | null;
};
