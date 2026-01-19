import { USERS } from '@/config/constants';
import prisma from '@/db/client';
import * as mailService from '@/mail/mail.service';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils';

import { TNotificationData, TSendNotificationArgs } from './types';

export const sendNotification = async ({ userIds, title, message, subject, lang = 'cs' }: TSendNotificationArgs) => {
  const twigTemplate = new TwigTemplate<TNotificationData>(lang);
  await twigTemplate.setTemplate('templates/email/adminNotification/index.twig');
  const emailBody = await twigTemplate.render({ title, message });

  const receivers = await prisma.users.findMany({
    where: {
      user_id: { in: userIds },
    },
    select: {
      email: true,
    },
  });

  const sender = await userService.getQaplineUserInfoForEmail(USERS.System.id);

  return await mailService.sendMail({
    to: receivers.map((user) => user.email),
    sender: sender,
    body: emailBody,
    subject: subject || title,
    attachments: [],
    internal: true,
  });
};
