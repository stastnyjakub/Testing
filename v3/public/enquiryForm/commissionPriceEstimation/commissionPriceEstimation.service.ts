import * as Sentry from '@sentry/node';

import * as commissionPriceEstimationService from '@/commissionPriceEstimation/commissionPriceEstimation.service';
import { TCreateCommissionPriceEstimationEntityArgs } from '@/commissionPriceEstimation/types';
import { ECronState } from '@/cron/types';
import { HttpException } from '@/errors';
import { calculateDistance, roundToLevel } from '@/utils';

import { FINAL_ESTIMATION_PRICE_PERCENTAGE_OFFSET } from '../enquiryForm.constants';
import { getTransportType, validateEstimationParameters } from '../enquiryForm.utils';
import { TCalculateCommissionPriceEstimationRequestBody } from '../types';

import { getPricePerLoadingMeterPerKilometer } from './getPricePerLoadingMeterPerKilometer';

export const logEstimation = async (data: TCreateCommissionPriceEstimationEntityArgs) => {
  // Possible error is not critical, so we don't need to throw it
  try {
    return await commissionPriceEstimationService.createEstimationEntity(data);
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const calculateCommissionPriceEstimation = async (
  { loadingMeters, endPoint, startPoint, email }: TCalculateCommissionPriceEstimationRequestBody,
  ipAddress: string,
) => {
  const distance = calculateDistance(startPoint, endPoint);
  const transportType = getTransportType(startPoint.country, endPoint.country);

  const pricePerLoadingMeterPerKilometer = await getPricePerLoadingMeterPerKilometer({
    distance,
    loadingMeters,
    transportType,
  });

  const commissionPriceEstimationEntityData: TCreateCommissionPriceEstimationEntityArgs = {
    ipAddress,
    parameters: validateEstimationParameters({ loadingMeters, startPoint, endPoint, email }),
    emailSentDate: null,
    cronState: ECronState.NEW,
    minPrice: null,
    maxPrice: null,
    email: email || null,
    commissionId: undefined,
    customerId: undefined,
  };

  if (pricePerLoadingMeterPerKilometer === null) {
    await logEstimation(commissionPriceEstimationEntityData);
    throw new HttpException(422, 'enquiryForm.notEnoughData');
  }

  const estimatedPrice = pricePerLoadingMeterPerKilometer * loadingMeters * distance;

  // Estimated price with a percentage offset
  const minimal = roundToLevel(estimatedPrice * (1 - FINAL_ESTIMATION_PRICE_PERCENTAGE_OFFSET), 'hundred');
  const maximal = roundToLevel(estimatedPrice * (1 + FINAL_ESTIMATION_PRICE_PERCENTAGE_OFFSET), 'hundred');

  // At this point, we need estimation id, so every error will be caught
  const { code } = await commissionPriceEstimationService.createEstimationEntity({
    ...commissionPriceEstimationEntityData,
    minPrice: minimal,
    maxPrice: maximal,
  });

  return {
    estimationCode: code,
    minimal,
    maximal,
  };
};
