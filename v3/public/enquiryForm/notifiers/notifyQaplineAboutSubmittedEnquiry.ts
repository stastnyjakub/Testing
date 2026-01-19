import * as commissionPriceEstimationEntityService from '@/commissionPriceEstimation/commissionPriceEstimation.service';
import { USERS } from '@/config/constants';
import env from '@/env';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as mailService from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils/mail/twigTemplate';

import { createLabelFromAddress } from '../enquiryForm.utils';
import {
  TCalculateCommissionPriceEstimationParameters,
  TNewEnquiryQaplineEmailData,
  TNotifyQaplineAboutSubmittedEnquiryArgs,
} from '../types';

const LANG = 'cs' as const;
const TEMPLATE_PATH = 'templates/email/newEnquiryQapline/index.twig' as const;

export const notifyQaplineAboutSubmittedEnquiry = async ({
  email,
  estimationCode,
  goodsWeight,
  loadingDate,
  phone,
  commissionId,
}: TNotifyQaplineAboutSubmittedEnquiryArgs) => {
  if (!env().NEW_ENQUIRY_CONTACT_EMAIL) {
    throw new HttpException(500, 'newEnquiryContactEmailNotSet');
  }
  const estimationEntity = await commissionPriceEstimationEntityService.getEstimationEntityOrThrow({
    code: estimationCode,
  });
  if (estimationEntity === null) {
    throw new NotFoundException(Entity.COMMISSION_PRICE_ESTIMATION);
  }
  const { minPrice, maxPrice, parameters } = estimationEntity;

  if (minPrice === null || maxPrice === null) {
    throw new HttpException(422, 'commissionPriceEstimation.estimationPricesNotSet');
  }

  const twigTemplate = new TwigTemplate<TNewEnquiryQaplineEmailData>(LANG);
  await twigTemplate.setTemplate(TEMPLATE_PATH);
  const { endPoint, loadingMeters, startPoint } = parameters as TCalculateCommissionPriceEstimationParameters;

  const body = await twigTemplate.render({
    email,
    goodsWeight,
    loadingDate,
    phone,
    loadingMeters: loadingMeters,
    startPoint: createLabelFromAddress(startPoint).join(', '),
    endPoint: createLabelFromAddress(endPoint).join(', '),
    minPrice,
    maxPrice,
    openLink: `${env().CO_URL}/commissions/${commissionId}`,
  });

  await mailService.sendMail({
    attachments: [],
    body,
    lang: 'cs',
    subject: t('newEnquiryQaplineMail.subject', 'cs'),
    to: [env().NEW_ENQUIRY_CONTACT_EMAIL],
    sender: await userService.getQaplineUserInfoForEmail(USERS.System.id),
    internal: true,
  });
};
