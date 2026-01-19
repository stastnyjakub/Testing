import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import moment from 'moment';

import { performTransaction } from '@/utils';

import { TProcessRegistrationRequestArgs } from './registrationRequest.types';
import { generateCustomerRegistrationToken, generateCustomerRegistrationUrl } from './registrationToken';
import { sendCustomerRegistrationEmail } from './sendCustomerRegistationEmail';

type TCreateRegistrationArgs = TProcessRegistrationRequestArgs & {
  customerId?: number;
  customerContactId?: number;
};
export const createRegistration = async (
  { companyIdentification, email, password, lang, customerId, customerContactId }: TCreateRegistrationArgs,
  transactionClient?: Prisma.TransactionClient,
) => {
  const transactionAction = async (transactionClient: Prisma.TransactionClient) => {
    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const { customerRegistration_id } = await transactionClient.customerRegistration.create({
      data: {
        companyIdentification,
        email,
        passwordHash,
        tsAdded: moment().unix(),
      },
    });

    const emailVerificationToken = await generateCustomerRegistrationToken(
      {
        customerRegistrationId: customerRegistration_id,
        customerId,
        customerContactId,
      },
      transactionClient,
    );
    const emailVerificationUrl = generateCustomerRegistrationUrl(emailVerificationToken);

    await sendCustomerRegistrationEmail({
      email,
      registrationLink: emailVerificationUrl,
      lang,
    });
  };

  transactionClient ? await transactionAction(transactionClient) : await performTransaction(transactionAction);
};
