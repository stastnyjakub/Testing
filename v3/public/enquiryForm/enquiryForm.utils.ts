import { HttpException } from '@/errors';

import { calculateCommissionPriceEstimationSearchParametersSchema } from './enquiryForm.model';
import { ETransportType, TCalculateCommissionPriceEstimationParameters, TEnquiryFormPoint } from './types';

/**
 * Binary search to find the index of the interval in which the target falls
 * @param arr - Array of intervals [0, 1, 10, 20] means (0, 1], (1, 10], (10, 20]
 * @param target - Search target
 * @returns index of the interval in which the target falls or null if not found
 */
export const getIndexOfValueFromIntervals = (arr: number[], target: number): number | null => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // If the target falls within the current interval
    if ((mid === 0 || target > arr[mid - 1]) && target <= arr[mid]) {
      return mid;
    }

    // If the target is greater than the current interval, move right
    if (target > arr[mid]) {
      left = mid + 1;
    } else {
      // Otherwise, move left
      right = mid - 1;
    }
  }

  // If no interval is found
  return null;
};

export const validateEstimationParameters = (parameters: unknown) => {
  const { value, error } = calculateCommissionPriceEstimationSearchParametersSchema
    .options({ stripUnknown: true })
    .validate(parameters);
  if (error) {
    throw new HttpException(400, 'enquiryForm.invalidEstimationParameters');
  }
  return value as unknown as TCalculateCommissionPriceEstimationParameters;
};

export const createLabelFromAddress = ({
  street,
  city,
  country,
  postalCode,
}: TEnquiryFormPoint & { postalCode?: string }) => {
  let firstLine = '';
  let secondLine = '';

  if (street) {
    firstLine += street;
  }
  if (city) {
    firstLine += firstLine === '' ? `${city}` : `, ${city}`;
  }
  if (postalCode) {
    secondLine += `${postalCode}`;
  }
  if (country) {
    secondLine += secondLine === '' ? `${country}` : `, ${country}`;
  }
  return [firstLine, secondLine];
};

/**
 *
 * @param loadingCountry - country where the goods are loaded in ISO format
 * @param dischargeCountry - country where the goods are discharged in ISO format
 */
export const getTransportType = (loadingCountry: string, dischargeCountry: string) => {
  const loadingCountryLow = loadingCountry.toLowerCase();
  const dischargeCountryLow = dischargeCountry.toLowerCase();

  if (loadingCountryLow === 'cz' && dischargeCountryLow === 'cz') {
    return ETransportType.Domestic;
  }
  if (loadingCountryLow === 'cz' && dischargeCountryLow !== 'cz') {
    return ETransportType.Export;
  }
  if (loadingCountryLow !== 'cz' && dischargeCountryLow === 'cz') {
    return ETransportType.Import;
  }
  return ETransportType.International;
};
