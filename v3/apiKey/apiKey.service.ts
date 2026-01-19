import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import moment from 'moment';

import { EAuthRole } from '@/auth/types';
import prisma from '@/db/client';
import { UnauthorizedException } from '@/errors';

import { splitApiKey } from './apiKey.utils';

export const createApiKey = async (role: EAuthRole) => {
  const secret = crypto.randomBytes(16).toString('hex');
  const key = crypto.randomUUID();
  const secretHash = await bcrypt.hash(secret, await bcrypt.genSalt(10));

  const apiKey = `${key}:${secret}`;

  const createdApiKey = await prisma.apiKey.create({
    data: {
      key,
      secretHash,
      role,
      tsAdded: moment().unix(),
    },
  });

  return {
    data: createdApiKey,
    apiKey,
  };
};

export const getApiKey = async (apiKey: string) => {
  const { key } = splitApiKey(apiKey);

  const apiKeyEntity = await prisma.apiKey.findUnique({
    where: {
      key,
    },
  });

  return apiKeyEntity;
};

export const getValidatedApiKeyOrThrow = async (apiKey: string) => {
  const apiKeyEntity = await getApiKey(apiKey);
  if (!apiKeyEntity || apiKeyEntity.active === false) throw new UnauthorizedException();

  const { secret } = splitApiKey(apiKey);
  const valid = await bcrypt.compare(secret, apiKeyEntity.secretHash);
  if (!valid) throw new UnauthorizedException();

  return apiKeyEntity;
};

export const useApiKey = async (apiKey: string) => {
  const { key } = splitApiKey(apiKey);
  const apiKeyEntity = await prisma.apiKey.update({
    where: {
      key,
    },
    data: {
      tsUsed: moment().valueOf(),
    },
  });

  return apiKeyEntity;
};
