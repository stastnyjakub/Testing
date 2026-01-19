import { ApiKey } from '@prisma/client';

import { EAuthRole, TAuthTokenPayload, TCustomerRegistrationAuthTokenPayload } from '@/auth/types';
import { UnauthenticatedException } from '@/errors';

// /**
//  * At runtime, throws if there's no payload.
//  * To TS, narrows `req.auth.payload` from `TAuthTokenPayload | undefined` to `TAuthTokenPayload`.
//  */
// export function assertAuthPayload(req: Request): asserts req.auth.payload is TAuthTokenPayload {
// }

type TReqAuth = {
  payload?: TAuthTokenPayload;
  token?: string;
};
export function assertAuthenticatedUser(reqAuth: TReqAuth): asserts reqAuth is Required<TReqAuth> {
  if (!reqAuth.payload || !reqAuth.token) throw new UnauthenticatedException();
}

type TReqAuthApiToken = {
  apiKey?: ApiKey;
};
export function assertAuthenticatedApiToken(reqAuth: TReqAuthApiToken): asserts reqAuth is Required<TReqAuthApiToken> {
  if (!reqAuth.apiKey) throw new UnauthenticatedException();
}

type TReqAuthCustomerRegistration = {
  payload?: TCustomerRegistrationAuthTokenPayload;
  token?: string;
};
export function assertAuthenticatedCustomerRegistration(
  reqAuth: TReqAuth,
): asserts reqAuth is Required<TReqAuthCustomerRegistration> {
  if (!reqAuth.payload || !reqAuth.token) throw new UnauthenticatedException();
  if (reqAuth.payload.role !== EAuthRole.CustomerRegistration) {
    throw new UnauthenticatedException();
  }
}
