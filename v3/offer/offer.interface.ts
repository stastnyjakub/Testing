export type CreateBody = {
  enquiryId: number;
  dispatcherId: number;
  response: boolean;
  price: number | null;
  currency: string;
};

export type UpdateBody = {
  preferenced: boolean;
};

export type UpdateOfferParams = {
  offerId: number;
  preferenced?: boolean;
  note?: string | null;
};
