import * as commissionPriceEstimationEntityService from '@/commissionPriceEstimation/commissionPriceEstimation.service';
import { USERS } from '@/config/constants';
import { Entity, NotFoundException } from '@/errors';
import * as mailService from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils/mail/twigTemplate';

import { createLabelFromAddress } from '../enquiryForm.utils';
import {
  TCalculateCommissionPriceEstimationParameters,
  TNewEnquiryCustomerEmailData,
  TNotifyCustomerAboutSubmittedEnquiryArgs,
} from '../types';

export const notifyCustomerAboutSubmittedEnquiry = async ({
  email,
  estimationCode,
  goodsWeight,
  loadingDate,
  phone,
}: TNotifyCustomerAboutSubmittedEnquiryArgs) => {
  const estimationEntity = await commissionPriceEstimationEntityService.getEstimationEntityOrThrow({
    code: estimationCode,
  });
  if (estimationEntity === null) {
    throw new NotFoundException(Entity.COMMISSION_PRICE_ESTIMATION);
  }
  const { minPrice, maxPrice, parameters } = estimationEntity;

  if (minPrice === null || maxPrice === null) {
    throw new Error('Estimation prices are not set.');
  }

  const twigTemplate = new TwigTemplate<TNewEnquiryCustomerEmailData>('cs');
  await twigTemplate.setTemplate('templates/email/newEnquiryCustomer/index.twig');
  const { endPoint, loadingMeters, startPoint } = parameters as TCalculateCommissionPriceEstimationParameters;

  const operatingDispatcher = await userService.getQaplineUserInfoForEmail(USERS.JindraMachan.id);

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
    dispatcher: operatingDispatcher,
  });

  await mailService.sendMail({
    attachments: [],
    body,
    lang: 'cs',
    subject: t('newEnquiryMail.subject', 'cs'),
    to: [email],
    sender: operatingDispatcher,
  });
};
