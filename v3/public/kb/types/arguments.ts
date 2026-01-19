import { TOauth2AuthorizationCallbackRequestQuery } from './request';

export type TSaveOauth0RegistrationDataArgs = {
  encryptedData: string;
  salt: string;
};

export type TProcessOAuth2AuthorizationArgs = Pick<TOauth2AuthorizationCallbackRequestQuery, 'code' | 'client_id'>;
