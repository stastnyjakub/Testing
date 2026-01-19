import moment from 'moment';

import { QaplineBillingInfo } from '../../config/constants';
import { CommissionSubstitute, PdfInvoice, PdfSubstitute } from '../invoice.interface';
import { getQRCode } from '../qr/qr.service';
import { InvoiceData } from '../qr/qr.types';
import { convertDateToISO8601 } from '../qr/qr.utils';

import { getRate } from './rates';
import { calcPrices } from './xmlHelpers';

export const getSubstitutions = async (invoice: PdfInvoice): Promise<PdfSubstitute> => {
  let priceNone = 0;
  let priceHigh = 0;
  let priceVatHigh = 0;

  const commissions: CommissionSubstitute[] = invoice.commissions.map((commission) => {
    const prices = calcPrices(commission.price, commission.vat);

    if (commission.vat === 0) priceNone += commission.price;
    else {
      priceHigh += commission.price;
      priceVatHigh += prices.priceVat;
    }

    return {
      ...commission,
      priceVat: prices.priceVat,
      priceWithVat: prices.priceSum,
    };
  });

  const price = priceNone + priceHigh;
  const priceWithVat = price + priceVatHigh;
  const priceTotal = priceWithVat;
  const rounding = invoice.rateBase ? priceTotal - priceWithVat : 0;
  const rateBase = await getRate(invoice.performanceDate, invoice.currency);

  const totalPriceNTB = commissions.reduce((acc, commission) => {
    if (commission.vat === 0) {
      return acc + commission.price * rateBase;
    }
    return acc;
  }, 0);

  const totalPriceTB0 = commissions.reduce((acc, commission) => {
    if (commission.vat !== 0) {
      return acc + commission.price * rateBase;
    }
    return acc;
  }, 0);

  const currencyToACC = {
    CZK: `${QaplineBillingInfo.bank.CZK.iban}+${QaplineBillingInfo.bank.CZK.swift}`,
    EUR: `${QaplineBillingInfo.bank.EUR.iban}+${QaplineBillingInfo.bank.EUR.swift}`,
  };
  const inr = Number(invoice.registrationNumber);

  const invoiceData: InvoiceData = {
    TP: 0,
    qrplatba: 1,
    ACC: currencyToACC[invoice.currency] || currencyToACC.EUR,
    AM: priceTotal,
    CC: invoice.currency,
    DD: convertDateToISO8601(invoice.exposureDate),
    DT: convertDateToISO8601(invoice.maturityDate),
    ID: invoice.varSymbol,
    'X-VS': Number(invoice.varSymbol),
    DUZP: convertDateToISO8601(invoice.performanceDate),
    INI: Number(QaplineBillingInfo.cin),
    INR: !isNaN(inr) && invoice.registrationNumber.length === 8 ? inr : undefined,
    ON: invoice.varSymbol,
    VII: QaplineBillingInfo.vat,
    VIR: invoice.taxId,
    T0: priceVatHigh * rateBase,
    FX: rateBase,
    NTB: totalPriceNTB === 0 ? undefined : totalPriceNTB,
    TB0: totalPriceTB0 === 0 ? undefined : totalPriceTB0,
  };

  return {
    ...invoice,
    rateBase,
    price,
    priceVat: priceVatHigh,
    priceWithVat,
    rounding,
    qrCode: await getQRCode(invoiceData),
    priceTotal,
    priceNone: (priceNone + rounding) * rateBase,
    priceHigh: priceHigh * rateBase,
    priceVatHigh: priceVatHigh * rateBase,
    priceHighWithVat: (priceHigh + priceVatHigh) * rateBase,
    commissions,
  };
};

export const mapLang = (lang: string) => {
  if (['cs', 'de', 'en'].includes(lang)) {
    return lang;
  }

  switch (lang) {
    case 'čeština':
      return 'cs';
    case 'němčina':
      return 'de';
    case 'angličtina':
      return 'en';
    default:
      return 'cs';
  }
};

export const formatDate = (unix: string | number | bigint) => {
  if (!unix) return '';
  const date = moment.unix(Number(unix) / 1000);
  return date.format('D.M.YYYY');
};
