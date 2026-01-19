import axios, { AxiosError } from 'axios';

import env from '@/env';
import { HttpException } from '@/errors';
import { Lang } from '@/types';
import { is4xx } from '@/utils';

import { TMapBoxGeocodingForwardResponse } from '../geocoding.types';
import { transformMapBoxFeature } from '../geocoding.utils';

const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/search/geocode/v6/forward';
export const searchLocationByText = async (text: string, lang: Lang) => {
  try {
    const {
      data: { features },
    } = await axios<TMapBoxGeocodingForwardResponse>({
      method: 'GET',
      url: MAPBOX_GEOCODING_URL,
      params: {
        access_token: env().MAPBOX_TOKEN,
        language: lang,
        limit: 5,
        q: text,
        types: 'address,street,place',
        proximity: 'ip',
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
