import { Entity, NotFoundException } from '@/errors';
import * as userService from '@/user/user.service';

import { TUserAuthTokenPayload } from '../types';

import { validateUserAuthTokenPayload } from './tokens.model';

export const getUserTokenPayload = async (userId: number): Promise<TUserAuthTokenPayload> => {
  const user = await userService.getUser({
    userId,
  });
  if (!user) throw new NotFoundException(Entity.USER);
  const { user_id, email, name, surname, userRoles, number } = user;

  const payload: TUserAuthTokenPayload = {
    userId: user_id,
    number,
    email,
    name,
    surname,
    role: userRoles[0].role.name as TUserAuthTokenPayload['role'],
  };

  return validateUserAuthTokenPayload(payload);
};
