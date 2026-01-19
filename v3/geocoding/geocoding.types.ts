export type TForwardResponseBody = {
  street: string;
  addressNumber: string;
  city: string;
  postCode: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}[];

export type TMapBoxGeocodingForwardResponse = {
  type: 'FeatureCollection';
  features: TMapBoxFeature[];
  attribution: string;
};
export type TMapBoxGeocodingReverseResponse = {
  type: 'FeatureCollection';
  features: TMapBoxFeature[];
  attribution: string;
};

export type TMapBoxFeature = {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: TMapBoxFeatureProperties;
};

export type TMapBoxFeatureProperties = {
  mapbox_id: string;
  feature_type: 'address' | 'street' | 'place';
  full_name: string;
  name: string;
  name_preferred: string;
  coordinates: {
    longitude: number;
    latitude: number;
    accuracy: string;
  };
  context: TMapBoxFeatureContextAddress;
};

export type TMapBoxFeatureContextAddress = {
  address?: {
    mapbox_id: string;
    address_number: string;
    street_name: string;
    name: string;
  };
  street?: {
    mapbox_id: string;
    name: string;
  };
  postcode?: {
    mapbox_id: string;
    name: string;
  };
  locality?: {
    mapbox_id: string;
    name: string;
    translations?: {
      cs?: {
        language: string;
        name: string;
      };
    };
  };
  place?: {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
    translations?: {
      cs?: {
        language: string;
        name: string;
      };
    };
  };
  region: {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
    region_code: string;
    region_code_full: string;
    translations?: {
      cs?: {
        language: string;
        name: string;
      };
    };
  };
  country: {
    mapbox_id: string;
    name: string;
    wikidata_id: string;
    country_code: string;
    country_code_alpha_3: string;
    translations?: {
      cs?: {
        language: string;
        name: string;
      };
    };
  };
};
