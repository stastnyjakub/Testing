import bcrypt from 'bcryptjs';

import { HttpException, UnauthenticatedException } from '@/errors';
import * as userService from '@/user/user.service';

import { generateAccessToken, generateRefreshToken } from './tokens/tokens.service';

export type THandleLoginArgs = {
  email: string;
  password: string;
};
export const handleLogin = async ({ email, password }: THandleLoginArgs) => {
  const user = await userService.getUser({ email, includeUnsafeValues: true });
  if (!user) throw new UnauthenticatedException();
  const { user_id, passwordHash } = user;

  if (!passwordHash) {
    throw new HttpException(401, 'login.passwordNotSet');
  }
  const isPasswordValid = await bcrypt.compare(password, passwordHash);
  if (!isPasswordValid) throw new HttpException(401, 'login.invalidPassword');

  const accessToken = await generateAccessToken(user_id);
  const refreshToken = await generateRefreshToken(user_id);

  return {
    accessToken,
    refreshToken,
  };
};

export * from './tokens/tokens.service';
export * from './permissions/permissions.service';
