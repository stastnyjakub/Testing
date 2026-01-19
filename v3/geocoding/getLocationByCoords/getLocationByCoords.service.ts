import axios, { AxiosError } from 'axios';

import env from '@/env';
import { HttpException } from '@/errors';
import { Lang } from '@/types';
import { is4xx } from '@/utils';

import { TMapBoxGeocodingReverseResponse } from '../geocoding.types';
import { transformMapBoxFeature } from '../geocoding.utils';

export type TGetLocationByCoordsArgs = {
  latitude: number;
  longitude: number;
  lang: Lang;
};
const MAPBOX_REVERSE_GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/reverse';
export const getLocationByCoords = async ({ latitude, longitude, lang }: TGetLocationByCoordsArgs) => {
  try {
    const {
      data: { features },
    } = await axios.get<TMapBoxGeocodingReverseResponse>(MAPBOX_REVERSE_GEOCODING_URL, {
      params: {
        access_token: env().MAPBOX_TOKEN,
        latitude,
        longitude,
        language: lang,
        types: 'address,street,place',
      },
    });
    return features.map((feature) => transformMapBoxFeature(feature));
  } catch (e) {
    if (!(e instanceof AxiosError)) {
      throw e;
    }
    const { response } = e;
    if (response && is4xx(response.status)) {
      throw new HttpException(response.status, 'mapboxError', response.data);
    }
    throw new HttpException(500, 'serverError', response?.data);
  }
};
