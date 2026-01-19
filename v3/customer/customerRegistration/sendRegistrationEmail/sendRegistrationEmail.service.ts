import { CloudTasksClient } from '@google-cloud/tasks';
import { t } from 'i18next';

import { USERS } from '@/config/constants';
import { routes } from '@/config/routes';
import * as customerService from '@/customer/customer.service';
import env from '@/env';
import { Entity, NotFoundException } from '@/errors';
import { loggerService } from '@/logging/logging.service';
import * as mailService from '@/mail/mail.service';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils';

import { getRegistration } from '../customerRegistration.service';
import {
  generateCustomerRegistrationToken,
  generateCustomerRegistrationUrl,
} from '../registrationRequest/registrationToken';
import { TCustomerRegistrationEmail } from '../types';

export type TSendRegistrationEmailArgs = {
  customerRegistrationId: number;
  invitation?: boolean;
};
export const sendRegistrationEmail = async ({ customerRegistrationId, invitation }: TSendRegistrationEmailArgs) => {
  const registration = await getRegistration({ customerRegistrationId });
  if (!registration) throw new NotFoundException(Entity.CUSTOMER_REGISTRATION);
  const {
    email,
    companyIdentification,
    language: { languageCode },
  } = registration;

  const customer = await customerService.getCustomer({ companyRegistrationNumber: companyIdentification });
  const emailVerificationToken = await generateCustomerRegistrationToken({
    customerRegistrationId,
    customerId: customer?.customer_id,
  });
  const registrationLink = generateCustomerRegistrationUrl(emailVerificationToken);

  const twigTemplate = new TwigTemplate<TCustomerRegistrationEmail>(languageCode as Lang);
  if (invitation) {
    await twigTemplate.setTemplate('templates/email/customerRegistration/invitation/index.twig');
  } else {
    await twigTemplate.setTemplate('templates/email/customerRegistration/registration/index.twig');
  }

  const body = await twigTemplate.render({
    registrationLink,
  });

  await mailService.sendMail({
    attachments: [],
    body,
    lang: languageCode,
    subject: t(`customerRegistration.email.${invitation ? 'invitation' : 'registration'}.subject`, languageCode),
    to: [email],
    sender: await userService.getQaplineUserInfoForEmail(USERS.System.id),
    internal: true,
  });
};

export type TQueueSendRegistrationEmailArgs = {
  customerRegistrationId: number;
  invitation?: boolean;
};
export const queueSendRegistrationEmail = async ({
  customerRegistrationId,
  invitation = false,
}: TQueueSendRegistrationEmailArgs) => {
  if (env().SERVER_URL.includes('localhost')) {
    loggerService.info(
      `Skipping Google Cloud Tasks queue for 'localhost' environment. Customer Registration ID: ${customerRegistrationId}`,
    );
    return;
  }

  const tasksClient = new CloudTasksClient();
  const parent = tasksClient.queuePath(env().GCLOUD_PROJECT_ID, 'europe-west3', 'mailing');
  const [response] = await tasksClient.createTask({
    parent,
    task: {
      httpRequest: {
        httpMethod: 'POST',
        url: `${env().SERVER_URL}${routes.v3.customer.registration.send}`,
        headers: {
          'x-api-key': env().JOB_API_KEY,
        },
        body: JSON.stringify({
          customerRegistrationId,
          invitation,
        }),
      },
    },
  });
  return response;
};
