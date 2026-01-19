import { Response } from 'express';
import jwt from 'jsonwebtoken';
import moment from 'moment';

import env from '@/env';
import { UnauthenticatedException } from '@/errors';
import * as userService from '@/user/user.service';
import { ETimeUnit, getTimeInMs } from '@/utils';
import { timestamp } from '@/utils';

import { TAuthTokenPayload } from '../types';

import { validateAuthTokenPayload } from './tokens.model';
import { getUserTokenPayload } from './tokens.utils';

export type THandleTokenRefreshArgs = {
  refreshToken: string;
};
export const getRefreshedAuthTokens = async ({ refreshToken }: THandleTokenRefreshArgs) => {
  const { userId, exp: tokenExpirationDate } = await verifyRefreshToken(refreshToken);

  const user = await userService.getUser({ userId });
  if (!user) throw new UnauthenticatedException();
  const { user_id } = user;

  const accessToken = await generateAccessToken(user_id);

  const getNewRefreshToken = async (userId: number, tokenExpirationDate: number) => {
    const tokenExpirationDateMoment = timestamp(tokenExpirationDate);
    if (tokenExpirationDateMoment === null) throw new Error('Invalid token expiration date');

    if (tokenExpirationDateMoment.diff(moment(), 'minutes') > 5) return undefined;
    return await generateRefreshToken(userId);
  };
  if (!tokenExpirationDate) throw new Error('Token expiration date is missing');
  const newRefreshToken = await getNewRefreshToken(user_id, tokenExpirationDate);

  return {
    accessToken,
    newRefreshToken,
  };
};

export type TGetSignedTokenArgs = {
  payload: TAuthTokenPayload;
  expiresIn: string;
};
export const getSignedToken = async ({ payload, expiresIn }: TGetSignedTokenArgs) => {
  const envKey = env().QL_JWT_PRIVATE_KEY;

  const token = jwt.sign(payload, envKey, { expiresIn });
  return token;
};

type TGetSignedTokenForUserArgs = {
  userId: number;
  expiresIn: string;
};
const getSignedTokenForUser = async ({ userId, expiresIn }: TGetSignedTokenForUserArgs) => {
  const payload = await getUserTokenPayload(userId);
  const token = await getSignedToken({ payload, expiresIn });
  return token;
};
export const generateAccessToken = async (userId: number) => await getSignedTokenForUser({ userId, expiresIn: '15m' });
export const generateRefreshToken = async (userId: number) => await getSignedTokenForUser({ userId, expiresIn: '14d' });

export const setRefreshTokenCookie = (res: Response, refreshToken: string, maxAge?: number): void => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: maxAge ? maxAge : getTimeInMs(14, ETimeUnit.Days),
  });
};

export const verifyToken = async (token: string) => {
  try {
    const payload = validateAuthTokenPayload(jwt.verify(token, env().QL_JWT_PRIVATE_KEY));
    return payload;
  } catch (error) {
    throw new UnauthenticatedException();
  }
};
export const verifyRefreshToken = async (refreshToken: string) => await verifyToken(refreshToken);
export const verifyAccessToken = async (accessToken: string) => await verifyToken(accessToken);
