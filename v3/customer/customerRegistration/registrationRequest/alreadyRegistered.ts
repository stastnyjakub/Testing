import { t } from 'i18next';

import { USERS } from '@/config/constants';
import * as mailService from '@/mail/mail.service';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils';

import { TCustomerAlreadyRegisteredEmail } from '../types';

export type TNotifyCustomerAlreadyRegisteredArgs = {
  email: string;
  lang: Lang;
  customerOwnerEmail: string;
};
export const notifyCustomerAlreadyRegistered = async ({
  email,
  customerOwnerEmail,
  lang,
}: TNotifyCustomerAlreadyRegisteredArgs) => {
  const twigTemplate = new TwigTemplate<TCustomerAlreadyRegisteredEmail>(lang);
  await twigTemplate.setTemplate('templates/email/customerRegistration/alreadyRegistered/index.twig');

  const body = await twigTemplate.render({
    customerOwnerEmail,
  });

  await mailService.sendMail({
    attachments: [],
    body,
    lang,
    subject: t('customerRegistration.email.alreadyRegistered.subject', lang),
    to: [email],
    sender: await userService.getQaplineUserInfoForEmail(USERS.System.id),
    internal: true,
  });
};
