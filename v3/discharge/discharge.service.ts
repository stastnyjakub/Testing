import FormData from 'form-data';
import fs from 'fs';

import { Entity, NotFoundException } from '@/errors';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { generateGeneralEmailBody, generatePdf, ProcessorType } from '@/utils';

import * as commissionService from '../commission/commission.service';
import * as mailService from '../mail/mail.service';

export const getPdf = async (file: string): Promise<Buffer> => {
  const form = new FormData();
  form.append('files', file, 'index.html');
  form.append('files', fs.readFileSync('./resources/assets/logo.png'), 'logo.png');
  return await generatePdf(form, ProcessorType.HTML);
};

export type TSendDeliveryMailArgs = {
  emails: string[];
  message: string;
  subject: string;
  commissionId: number;
  locationId: number;
  lang: Lang;
  senderId: number;
};
export const sendDischargeMail = async ({
  commissionId,
  locationId,
  emails,
  lang,
  message,
  subject,
  senderId,
}: TSendDeliveryMailArgs) => {
  const commission = await commissionService.getOneCommission(commissionId);
  if (!commission) throw new NotFoundException(Entity.COMMISSION);

  const dischargeLocation = commission.commissiondischarge.find((val) => val.location_id === locationId);
  if (!dischargeLocation) throw new NotFoundException(Entity.COMMISSION_DISCHARGE);

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
    attachments: [{ path: `discharge/${commission.qid}-${dischargeLocation.commissionDischarge_id}.pdf` }],
  });

  return {
    successfulEmails,
    rejectedEmails,
  };
};
