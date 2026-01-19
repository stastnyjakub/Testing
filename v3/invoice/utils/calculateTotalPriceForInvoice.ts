import { calculateCommissionPrice } from '@/commission/commission.utils';
import { ECurrency } from '@/types';

export type TCalculateTotalPriceForInvoiceArgs = {
  commissions: {
    priceCustomer: number;
    currencyCustomer: ECurrency;
    vat: number;
  }[];
};

export const calculateTotalPriceForInvoice = ({ commissions }: TCalculateTotalPriceForInvoiceArgs) => {
  const withVat = commissions.reduce((acc, { priceCustomer, vat }) => acc + priceCustomer * (1 + vat / 100), 0);
  const withoutVat = commissions.reduce((acc, { priceCustomer }) => acc + priceCustomer, 0);

  // we use toFixed and parseFloat to fix floating point arithmetic issues
  return {
    withVat: parseFloat(withVat.toFixed(2)),
    withoutVat: parseFloat(withoutVat.toFixed(2)),
  };
};

export type TCalculateTotalPriceInCZKForInvoiceArgs = {
  commissions: {
    priceCustomer: number;
    currencyCustomer: ECurrency;
    exchangeRateCustomer: number;
    vat: number;
  }[];
};

export const calculateTotalPriceInCZKForInvoice = ({ commissions }: TCalculateTotalPriceInCZKForInvoiceArgs) => {
  const { withVat, withoutVat } = commissions.reduce(
    (prev, { currencyCustomer, exchangeRateCustomer, priceCustomer, vat }) => {
      const priceCustomerNumber = Number(priceCustomer);
      const exchangeRateCustomerNumber = Number(exchangeRateCustomer);

      if (isNaN(priceCustomerNumber)) return prev;
      const { withVat, withoutVat } = calculateCommissionPrice({
        customerPrice: priceCustomerNumber,
        customerCurrency: currencyCustomer as ECurrency,
        exchangeRateCustomer: exchangeRateCustomerNumber,
        vat: vat,
      });
      return {
        withVat: prev.withVat + (withVat || 0),
        withoutVat: prev.withoutVat + withoutVat,
      };
    },
    {
      withVat: 0,
      withoutVat: 0,
    },
  );

  // we use toFixed and parseFloat to fix floating point arithmetic issues
  return {
    withVat: parseFloat(withVat.toFixed(2)),
    withoutVat: parseFloat(withoutVat.toFixed(2)),
  };
};
