import { TMapBoxFeature } from './geocoding.types';

export const getCityFromFeature = ({ properties: { context } }: TMapBoxFeature) => {
  if (context.place) {
    return context?.place?.translations?.cs?.name || context?.place?.name || null;
  }
  return context?.locality?.translations?.cs?.name || context?.locality?.name || null;
};

export const transformMapBoxFeature = (feature: TMapBoxFeature) => {
  const { geometry, properties } = feature;

  return {
    city: getCityFromFeature(feature),
    country: properties.context.country?.translations?.cs?.name || properties.context.country.name,
    countryCode: properties.context.country.country_code,
    latitude: geometry.coordinates[1],
    longitude: geometry.coordinates[0],

    street: properties.context?.street?.name,
    postCode: properties.context?.postcode?.name,
    addressNumber: properties.context?.address?.address_number,
  };
};
