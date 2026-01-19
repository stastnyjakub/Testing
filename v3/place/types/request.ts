export type TListPlacesRequestQuery = {
  dispatcherId: number;
};

export type TUpdatePlacesRequestBody = {
  places: {
    placeId: number;
    city?: string;
    country?: string;
    countryCode?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    note?: string;
    directionLoading?: boolean;
    directionDischarge?: boolean;
  }[];
};
