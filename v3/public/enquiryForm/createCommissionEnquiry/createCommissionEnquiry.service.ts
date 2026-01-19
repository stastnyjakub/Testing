import * as Sentry from '@sentry/node';

import * as commissionPriceEstimationEntityService from '@/commissionPriceEstimation/commissionPriceEstimation.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import { performTransaction } from '@/utils';

import { validateEstimationParameters } from '../enquiryForm.utils';
import {
  notifyCustomerAboutSubmittedEnquiry,
  notifyQaplineAboutSubmittedEnquiry,
} from '../notifiers/notifiers.service';
import { THandleEnquiryFormRequestBody } from '../types';

import { createEnquiryCommission } from './createEnquiryCommission';
import { getOrCreateCustomer } from './handleCustomer';

export const createCommissionEnquiry = async ({
  email,
  phone,
  loadingDate,
  estimationCode,
  goodsWeight,
}: THandleEnquiryFormRequestBody) => {
  const estimation = await commissionPriceEstimationEntityService.getEstimationEntityOrThrow({
    code: estimationCode,
  });
  if (estimation === null) {
    throw new NotFoundException(Entity.COMMISSION_PRICE_ESTIMATION);
  }

  // If commission or customer is already assigned to this estimation, enquiry was already created
  // Preventing multiple enquiries for the same estimation
  if (estimation.commission_id || estimation.customer_id) {
    throw new HttpException(422, 'commissionPriceEstimation.estimationAlreadyUsed');
  }
  const { startPoint, endPoint, loadingMeters } = validateEstimationParameters(estimation.parameters);

  const { commission, customer } = await performTransaction(async (transactionClient) => {
    // Create new potential customer with partial data before the commission is created
    // If the customer already exists, it will be updated
    const customer = await getOrCreateCustomer({
      email,
      endPoint,
      startPoint,
      phone,
      transactionClient,
    });
    if (customer === null) throw new NotFoundException(Entity.CUSTOMER);

    // Create new commission enquiry with partial data with the potential customer
    const commission = await createEnquiryCommission({
      customer,
      loadingDate,
      endPoint,
      goodsWeight,
      startPoint,
      loadingMeters,
      transactionClient,
    });
    if (!commission) throw new Error('Commission creation failed');

    const { customer_id, billingEmail } = customer;
    // Assign new commission and customer to the estimation
    // Also update email
    const updatedEstimationEntity = await commissionPriceEstimationEntityService.updateEstimationEntity(
      {
        code: estimationCode,
        commissionId: commission.commission_id,
        customerId: customer_id,
        email: billingEmail,
      },
      transactionClient,
    );

    return { commission, customer, updatedEstimationEntity };
  });

  // Mail error should not affect the submit process
  await notifyQaplineAboutSubmittedEnquiry({
    email,
    estimationCode,
    goodsWeight,
    loadingDate,
    phone,
    commissionId: commission.commission_id,
  }).catch((error) => {
    Sentry.captureException(error);
  });
  await notifyCustomerAboutSubmittedEnquiry({ email, estimationCode, goodsWeight, loadingDate, phone }).catch(
    (error) => {
      console.log(error);
      Sentry.captureException(error);
    },
  );

  return { commission, customer, estimation: estimation };
};
