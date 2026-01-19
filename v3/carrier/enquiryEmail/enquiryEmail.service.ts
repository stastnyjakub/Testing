import { TCreateRequestBody as EnquiryCreateBody } from 'v3/enquiry/enquiry.interface';

import { createEnquiry } from '@/enquiry/enquiry.service';
import { TBaseMail } from '@/mail/mail.interface';
import { sendMail } from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import { Lang } from '@/types';
import { generateGeneralEmailBody } from '@/utils';

import { CarrierEmailEnquiryEmailRequestBody } from '../carrier.interface';

export const sendEnquiryMail = async (baseMail: TBaseMail, body: string, subject: string) => {
  const emailBody = await generateGeneralEmailBody({
    lang: baseMail.lang as Lang,
    message: body,
    sender: baseMail.sender,
    title: subject,
  });

  const mail = {
    ...baseMail,
    body: emailBody,
    subject: subject || (t('enquiryMail.subject', baseMail.lang) as string),
  };
  return await sendMail(mail);
};

// export const addLinkToEnquiryEmail = async (
//   receiver: Dispatcher & { language: language },
//   emailBody: string,
//   enquiryId: number,
// ) => {
//   const language = (receiver.language?.languageCode || getLanguageCallback(ELanguageCallbackContext.MAILING)) as Lang;

//   const addLink = (emailBody: string, tLink: string, action: string) => {
//     if (emailBody.includes('{action}')) {
//       emailBody = emailBody.replace('{action}', action);
//     }
//     if (emailBody.includes('{link}')) {
//       return emailBody.replace('{link}', tLink);
//     }
//     return emailBody + `\n\n${tLink}`;
//   };

//   const isDispatcherRegistered = Boolean(receiver.password);
//   if (isDispatcherRegistered) {
//     const loginLink = generateLoginLink({
//       email: receiver.email,
//       enquiryId: enquiryId,
//     });
//     const translatedLoginLink = t('enquiryMail.registeredDispatcher', language, { link: loginLink });
//     const action = t('enquiryMail.login', language);
//     return addLink(emailBody, translatedLoginLink, action);
//   }

//   const onboardingToken = await generateOnboardingToken({
//     carrierId: receiver.carrier_id,
//     dispatcherId: receiver.dispatcher_id,
//   });
//   const onboardingLink = getOnboardingLink(onboardingToken.token, language, enquiryId);
//   const translatedOnboardingLink = t('enquiryMail.unregisteredDispatcher', language, { link: onboardingLink });
//   const action = t('enquiryMail.register', language);

//   return addLink(emailBody, translatedOnboardingLink, action);
// };

export const buildAndCreateEnquiry = async (body: CarrierEmailEnquiryEmailRequestBody) => {
  const createBody: EnquiryCreateBody = {
    commission_id: body.commissionId,
    note: null,
    contactedDispatchers: body.to.map(({ dispatcherId }) => dispatcherId),
    parameters: body.parameters,
  };
  const createdEnquiry = await createEnquiry(createBody);
  return createdEnquiry;
};
