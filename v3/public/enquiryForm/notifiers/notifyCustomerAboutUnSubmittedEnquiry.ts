import { USERS } from '@/config/constants';
import env from '@/env';
import * as mailService from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils/mail/twigTemplate';

import { createLabelFromAddress } from '../enquiryForm.utils';
import {
  TCalculateCommissionPriceEstimationParameters,
  TNotifyCustomerAboutUnSubmittedEnquiryArgs,
  TUnSubmittedEnquiryCustomerEmailData,
} from '../types';

const LANG = 'cs' as const;
const TEMPLATE_PATH = 'templates/email/unSubmittedEnquiry/index.twig' as const;

export const notifyCustomerAboutUnSubmittedEnquiry = async ({
  estimations,
}: TNotifyCustomerAboutUnSubmittedEnquiryArgs) => {
  const twigTemplate = new TwigTemplate<TUnSubmittedEnquiryCustomerEmailData>(LANG);
  await twigTemplate.setTemplate(TEMPLATE_PATH);

  const receiverEmail = estimations[0].email;
  if (!receiverEmail) {
    throw new Error('No email provided for the customer');
  }

  const operatingDispatcher = await userService.getQaplineUserInfoForEmail(USERS.JindraMachan.id);
  const transformedEstimations: TUnSubmittedEnquiryCustomerEmailData['estimations'] = estimations.map(
    ({ parameters, code, minPrice, maxPrice }) => {
      if (minPrice === null || maxPrice === null) {
        throw new Error(`Invalid minPrice or maxPrice for estimation with code: ${code}`);
      }

      const { endPoint, loadingMeters, startPoint } = parameters as TCalculateCommissionPriceEstimationParameters;
      return {
        // WebFlow has deep link functionality, so we can use it to open the enquiry form with prefilled data
        openLink: `${env().WEB_FLOW_URL}/?estimationCode=${code}`,
        loadingMeters: loadingMeters,
        maxPrice: maxPrice,
        minPrice: minPrice,
        endPoint: createLabelFromAddress(endPoint).join(', '),
        startPoint: createLabelFromAddress(startPoint).join(', '),
      };
    },
  );

  const body = await twigTemplate.render({
    estimations: transformedEstimations,
    dispatcher: operatingDispatcher,
  });

  await mailService.sendMail({
    attachments: [],
    body: body,
    lang: 'cs',
    subject: t('unSubmittedEnquiryCustomerMail.subject', 'cs'),
    // Estimations are grouped by email, so we can use the first one
    to: [receiverEmail],
    sender: operatingDispatcher,
  });
};
