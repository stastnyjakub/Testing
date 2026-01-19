import { TCreateRampRequestBody, TUpdateRampRequestBody } from './ramp/ramp.types';

export type TCreateLocationRequestBody = {
  city?: string | null;
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  postalCode?: string | null;
  street?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  note?: string | null;
  discharge?: boolean;
  loading?: boolean;
  areaMap?: string | null;
  ramps?: TCreateRampRequestBody[];
};

export type TUpdateLocationRequestBody = {
  city?: string | null;
  name?: string | null;
  country?: string | null;
  countryCode?: string | null;
  postalCode?: string | null;
  street?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  note?: string | null;
  discharge?: boolean;
  loading?: boolean;
  areaMap?: string | null;
  ramps?: ((TUpdateRampRequestBody & { rampId: number }) | TCreateRampRequestBody)[];
};
