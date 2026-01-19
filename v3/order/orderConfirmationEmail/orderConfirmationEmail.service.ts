import { Entity, NotFoundException } from '@/errors';
import * as mailService from '@/mail/mail.service';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { generateGeneralEmailBody } from '@/utils';

export type TSendOrderConfirmationMailArgs = {
  emails: string[];
  message: string;
  subject: string;
  lang: Lang;
  senderId: number;
};
export const sendOrderConfirmationMail = async ({
  emails,
  lang,
  message,
  subject,
  senderId,
}: TSendOrderConfirmationMailArgs) => {
  const sender = await userService.getQaplineUserInfoForEmail(senderId);
  if (!sender) throw new NotFoundException(Entity.USER);

  const emailBody = await generateGeneralEmailBody({
    lang,
    sender,
    message,
    title: subject,
  });

  const { rejectedEmails, successfulEmails } = await mailService.sendMail({
    body: emailBody,
    sender,
    subject,
    to: emails,
    attachments: [],
  });

  return {
    successfulEmails,
    rejectedEmails,
  };
};
