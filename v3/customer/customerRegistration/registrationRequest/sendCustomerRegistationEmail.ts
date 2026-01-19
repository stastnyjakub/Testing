import { t } from 'i18next';

import { USERS } from '@/config/constants';
import * as mailService from '@/mail/mail.service';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils';

import { TCustomerRegistrationEmail } from '../types';

export type TSendCustomerRegistrationEmailArgs = {
  email: string;
  registrationLink: string;
  lang: Lang;
};
export const sendCustomerRegistrationEmail = async ({
  email,
  registrationLink,
  lang,
}: TSendCustomerRegistrationEmailArgs) => {
  const twigTemplate = new TwigTemplate<TCustomerRegistrationEmail>(lang);
  await twigTemplate.setTemplate('templates/email/customerRegistration/confirmEmail/index.twig');

  const body = await twigTemplate.render({
    registrationLink,
  });

  await mailService.sendMail({
    attachments: [],
    body,
    lang,
    subject: t('customerRegistration.email.confirmEmail.subject', lang),
    to: [email],
    sender: await userService.getQaplineUserInfoForEmail(USERS.System.id),
    internal: true,
  });
};
