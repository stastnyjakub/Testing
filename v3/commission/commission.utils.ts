import { ECurrency } from '@/types';

import { TCalculateCommissionCostsArgs, TCalculateCommissionPriceArgs } from './types';

// Overload signatures
export function calculateCommissionPrice(args: {
  customerPrice: number;
  customerCurrency: ECurrency;
  exchangeRateCustomer?: number;
  vat: number;
}): { withVat: number; withoutVat: number };

export function calculateCommissionPrice(args: {
  customerPrice: number;
  customerCurrency: ECurrency;
  exchangeRateCustomer?: number;
  vat?: undefined;
}): { withoutVat: number };

export function calculateCommissionPrice({
  customerCurrency,
  customerPrice,
  exchangeRateCustomer,
  vat,
}: TCalculateCommissionPriceArgs) {
  // If vat is provided, calculate withVat and withoutVat
  vat = vat === undefined ? undefined : vat / 100;

  if (customerCurrency === ECurrency.CZK) {
    return {
      withVat: vat !== undefined ? customerPrice * (1 + vat) : undefined,
      withoutVat: customerPrice,
    };
  }
  if (customerCurrency === ECurrency.EUR) {
    return {
      withVat: vat !== undefined ? customerPrice * (1 + vat) * (exchangeRateCustomer || 1) : undefined,
      withoutVat: customerPrice * (exchangeRateCustomer || 1),
    };
  }
  return {
    withVat: vat ? 0 : undefined,
    withoutVat: 0,
  };
}

export function calculateCommissionCosts({
  carrierCurrency,
  carrierPrice,
  exchangeRateCarrier,
}: TCalculateCommissionCostsArgs) {
  if (carrierCurrency === ECurrency.CZK) {
    return {
      withoutVat: carrierPrice,
    };
  }
  if (carrierCurrency === ECurrency.EUR) {
    return {
      withoutVat: carrierPrice * (exchangeRateCarrier || 1),
    };
  }
  return {
    withoutVat: 0,
  };
}
