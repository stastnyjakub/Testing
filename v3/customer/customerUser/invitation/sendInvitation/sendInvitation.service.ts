import { t } from 'i18next';
import moment from 'moment';

import { EAuthRole } from '@/auth/types';
import { USERS } from '@/config/constants';
import * as customerUserService from '@/customer/customerUser/customerUser.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as languageService from '@/language/language.service';
import * as mailService from '@/mail/mail.service';
import { Lang } from '@/types';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils';

import { getInvitation } from '../getInvitation/getInvitation.service';
import { TCustomerUserInvitationEmail } from '../invitation.types';
import {
  generateCustomerUserRegistrationLink,
  generateCustomerUserRegistrationToken,
} from '../registrationToken/registrationToken.service';
import { updateInvitation } from '../updateInvitation/updateInvitation.service';

export type TSendInvitationArgs = {
  customerUserInvitationId: number;
};
export const sendInvitation = async ({ customerUserInvitationId }: TSendInvitationArgs) => {
  try {
    const invitation = await getInvitation(customerUserInvitationId);
    if (!invitation) throw new NotFoundException(Entity.CUSTOMER_USER_INVITATION);
    const { customerUser_id, customerUserInvitation_id, language_id, sender_id, used } = invitation;
    if (used) throw new HttpException(400, 'customerUserInvitation.alreadyUsed');

    const customerUserRegistrationUser = await userService.getUserWithUniqueRole(EAuthRole.CustomerUserRegistration);
    if (!customerUserRegistrationUser) throw new NotFoundException(Entity.USER);

    const senderUser = await userService.getUser({ userId: sender_id });
    if (!senderUser) throw new NotFoundException(Entity.USER);

    const language = await languageService.getLanguage({ languageId: language_id });
    if (!language) throw new NotFoundException(Entity.LANGUAGE);
    const languageCode = language.languageCode as Lang;

    const customerUser = await customerUserService.getCustomerUser({ customerUserId: customerUser_id });
    if (!customerUser) throw new NotFoundException(Entity.CUSTOMER_USER);

    const token = await generateCustomerUserRegistrationToken({
      customerUserId: customerUser_id,
      invitationId: customerUserInvitation_id,
      userId: customerUserRegistrationUser.user_id,
    });
    const registrationLink = generateCustomerUserRegistrationLink(token);

    const twigTemplate = new TwigTemplate<TCustomerUserInvitationEmail>(languageCode);
    await twigTemplate.setTemplate('templates/email/customerUserInvitation/index.twig');
    const body = await twigTemplate.render({
      registrationLink,
      senderEmail: senderUser.email,
    });

    await mailService.sendMail({
      attachments: [],
      body,
      lang: languageCode,
      subject: t('customerUserInvitation.email.subject', languageCode),
      to: [customerUser.user.email],
      sender: await userService.getQaplineUserInfoForEmail(USERS.System.id),
      internal: true,
    });

    await updateInvitation({ customerUserInvitationId, sent: true, sentAt: moment().unix() });
  } catch (error) {
    await updateInvitation({ customerUserInvitationId, sent: false });
    throw error;
  }
};
