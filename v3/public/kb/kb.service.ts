import moment from 'moment';

import { KbBankFacade } from '@/bank/kbBank/kbBankFacade.class';
import prisma from '@/db/client';

import { TProcessOAuth2AuthorizationArgs, TSaveOauth0RegistrationDataArgs } from './types/arguments';

export const saveClientRegistrationData = async (data: object) => {
  const kbCallbackResponse = await prisma.kbCallbackResponse.create({
    data: {
      response: data,
      tsAdded: moment().unix(),
    },
  });

  return kbCallbackResponse;
};

export const saveOauth0RegistrationData = async ({ encryptedData, salt }: TSaveOauth0RegistrationDataArgs) => {
  const kbCallbackResponse = await prisma.kbCallbackResponse.create({
    data: {
      response: {
        encryptedData,
        salt,
      },
      tsAdded: moment().unix(),
    },
  });

  return kbCallbackResponse;
};

export const processOAuth2Authorization = async ({ code, client_id }: TProcessOAuth2AuthorizationArgs) => {
  // Save the response to the database so that we can track the response
  await prisma.kbCallbackResponse.create({
    data: {
      response: {
        code,
        client_id,
      },
      tsAdded: moment().unix(),
    },
  });

  await KbBankFacade.processAuthorizationCode(code);
};
