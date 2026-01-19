import { onboardingtoken } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { EAuthRole, TOnboardingUserAuthTokenPayload } from '@/auth/types';
import env from '@/env';
import { Entity, NotFoundException } from '@/errors';
import { Lang } from '@/types';
import { generateGeneralEmailBody } from '@/utils';

import prisma from '../../db/client';
import { TBaseMail } from '../../mail/mail.interface';
import { sendMail } from '../../mail/mail.service';
import { t } from '../../middleware/i18n';
import * as userService from '../../user/user.service';

import { OnboardingEmailBody } from './onboarding.interface';

export const sendOnboardingMail = async (baseMail: TBaseMail, link: string) => {
  const subject = t('onboardingEmail.subject', baseMail.lang);
  const emailBody = await generateGeneralEmailBody({
    lang: baseMail.lang as Lang,
    message: t('onboardingEmail.body', baseMail.lang, { link }),
    sender: baseMail.sender,
    title: subject,
  });

  const mail = {
    ...baseMail,
    subject,
    body: emailBody,
  };
  return await sendMail(mail);
};

export const sendOnboardingMails = async (
  to: OnboardingEmailBody['to'],
  tokens: onboardingtoken[],
  dispatcher: OnboardingEmailBody['dispatcher'],
) => {
  const dispatcherUser = await userService.getUser({ email: dispatcher.email });
  if (!dispatcherUser) throw new NotFoundException(Entity.USER);
  const sender = await userService.getQaplineUserInfoForEmail(dispatcherUser.user_id);
  if (!sender) throw new NotFoundException(Entity.USER);

  return await Promise.all(
    tokens.map(({ token }, index) => {
      const link = getOnboardingLink(token, to[index].lang);
      const email: TBaseMail = {
        sender,
        to: [to[index].email],
        lang: to[index].lang,
        attachments: [],
      };
      return sendOnboardingMail(email, link);
    }),
  );
};

export const generateOnboardingTokens = async (to: OnboardingEmailBody['to'], carrier_id: number) => {
  return await Promise.all(
    to.map(({ dispatcher_id }) => generateOnboardingToken({ carrierId: carrier_id, dispatcherId: dispatcher_id })),
  );
};

export type TGenerateOnboardingTokenArgs = {
  carrierId: number;
  dispatcherId?: number;
};
export const generateOnboardingToken = async ({ carrierId, dispatcherId }: TGenerateOnboardingTokenArgs) => {
  const onboardingUser = await prisma.user.findFirst({
    where: {
      userRoles: {
        some: {
          role: {
            name: EAuthRole.OnboardingUser,
          },
        },
      },
    },
  });
  if (!onboardingUser) throw new NotFoundException(Entity.USER);
  const tokenPayload: TOnboardingUserAuthTokenPayload = {
    userId: onboardingUser.user_id,
    role: EAuthRole.OnboardingUser,
    carrierId,
    dispatcherId,
  };

  const token = jwt.sign(tokenPayload, env().QL_JWT_REFRESH_KEY, { expiresIn: '14d' });
  const onboardingToken = await prisma.onboardingtoken.create({
    data: { carrier_id: carrierId, token, dispatcher_id: dispatcherId },
  });

  return onboardingToken;
};

// create link for carrier onboarding
export const getOnboardingLink = (token: string, lang: string, enquiryId?: number) => {
  return `${env().CO_URL}/dispatcher/onboarding?token=${token}&lang=${lang}${enquiryId ? `&enquiryId=${enquiryId}` : ''}`;
};
