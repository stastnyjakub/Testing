import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import moment from 'moment';

import { Entity, NotFoundException } from '@/errors';
import * as languageService from '@/language/language.service';
import { performTransaction } from '@/utils';

import { TProcessRegistrationRequestArgs } from './registrationRequest.types';

type TCreateRegistrationArgs = TProcessRegistrationRequestArgs & {
  customerId?: number;
};
export const createRegistration = async (
  { companyIdentification, email, password, lang, customerId }: TCreateRegistrationArgs,
  transactionClient?: Prisma.TransactionClient,
) => {
  const language = await languageService.getLanguage({ languageCode: lang });
  if (!language) throw new NotFoundException(Entity.LANGUAGE);

  const transactionAction = async (transactionClient: Prisma.TransactionClient) => {
    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const customerRegistration = await transactionClient.customerRegistration.create({
      data: {
        companyIdentification,
        email,
        passwordHash,
        tsAdded: moment().unix(),
        language_id: language.language_id,
        customer_id: customerId,
      },
    });
    return customerRegistration;
  };

  return transactionClient ? await transactionAction(transactionClient) : await performTransaction(transactionAction);
};
