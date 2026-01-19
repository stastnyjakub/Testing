import { t } from 'i18next';

import { USERS } from '@/config/constants';
import * as mailService from '@/mail/mail.service';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils';

import { TUnknownUserEmail } from '../types';

export type TNotifyUnknownUserArgs = {
  email: string;
  lang: Lang;
};
export const notifyUnknownUser = async ({ email, lang }: TNotifyUnknownUserArgs) => {
  const twigTemplate = new TwigTemplate<TUnknownUserEmail>(lang);
  await twigTemplate.setTemplate('templates/email/customerRegistration/unknownUser/index.twig');

  const sender = await userService.getQaplineUserInfoForEmail(USERS.JindraMachan.id);

  const body = await twigTemplate.render({
    dispatcher: sender,
  });

  await mailService.sendMail({
    attachments: [],
    body,
    lang,
    subject: t('customerRegistration.email.unknownUser.subject', lang),
    to: [email],
    sender: await userService.getQaplineUserInfoForEmail(USERS.System.id),
    internal: true,
  });
};
