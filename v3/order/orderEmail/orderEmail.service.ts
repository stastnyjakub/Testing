import * as attachmentService from '@/attachment/attachment.service';
import { generateAttachmentUploadLink } from '@/attachment/uploadFiles/uploadFiles.utils';
//import * as onboardingService from '@/carrier/onboarding/onboarding.service';
import * as commissionService from '@/commission/commission.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as mailService from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { generateGeneralEmailBody } from '@/utils';

// export const addRegistrationSectionToEmailBody = async (body: string, qid: string, lang: string) => {
//   if (!body.includes('{registrationSection}')) return body;
//   const commission = await commissionService.getCommissionByQId(qid, { dispatcher: true });
//   if (!commission) throw new NotFoundException(Entity.COMMISSION);
//   const receiver = commission.dispatcher;
//   if (!receiver) throw new NotFoundException(Entity.DISPATCHER);
//   const isRegistered = Boolean(receiver.password);

//   if (isRegistered) return body.replace('{registrationSection}', '');

//   const onboardingToken = await onboardingService.generateOnboardingToken({
//     carrierId: receiver.carrier_id,
//     dispatcherId: receiver.dispatcher_id,
//   });
//   const onboardingLink = onboardingService.getOnboardingLink(onboardingToken.token, lang);

//   return body.replace('{registrationSection}', t('orderEmail.registrationSection', lang, { link: onboardingLink }));
// };

export const addAttachmentsUploadLinkSectionToEmailBody = async (body: string, qid: string, lang: Lang) => {
  if (!body.includes('{attachmentsUploadLink}')) return body;
  const commission = await commissionService.getCommissionByQId(qid);
  if (!commission) throw new NotFoundException(Entity.COMMISSION);

  const uploadToken = await attachmentService.createOrGetAttachmentUploadToken({
    commissionId: commission.commission_id,
    renew: true,
  });
  const uploadLink = generateAttachmentUploadLink(uploadToken.token);
  if (!uploadLink) throw new HttpException(500, 'serverError');

  return body.replace('{attachmentsUploadLink}', t('orderEmail.attachmentsUploadLinkText', lang, { uploadLink }));
};

export type TSendOrderMailArgs = {
  emails: string[];
  message: string;
  subject: string;
  commissionId: number;
  lang: Lang;
  senderId: number;
};
export const sendOrderMail = async ({ commissionId, emails, lang, message, subject, senderId }: TSendOrderMailArgs) => {
  const commission = await commissionService.getOneCommission(commissionId);
  if (!commission) throw new NotFoundException(Entity.COMMISSION);
  if (!commission.qid) throw new HttpException(500, 'Commission QID is not set');

  const sender = await userService.getQaplineUserInfoForEmail(senderId);
  if (!sender) throw new NotFoundException(Entity.USER);

  //let body = await addRegistrationSectionToEmailBody(message, commission.qid, lang);
  let body = message;
  body = await addAttachmentsUploadLinkSectionToEmailBody(body, commission.qid, lang);

  const emailBody = await generateGeneralEmailBody({
    lang,
    sender,
    title: subject,
    message: body,
  });

  const { rejectedEmails, successfulEmails } = await mailService.sendMail({
    body: emailBody,
    sender,
    subject,
    to: emails,
    attachments: [{ path: `order/${commission.qid}.pdf` }],
  });

  return {
    successfulEmails,
    rejectedEmails,
  };
};
