import moment from 'moment-timezone';

export const parseVatRate = (percentage: string) => {
  switch (percentage) {
    case '0':
      return 'none';
    case '10':
      return 'third';
    case '15':
      return 'low';
    default:
      return 'high';
  }
};

export const parseAccount = (currencyCustomer: string) => {
  if (currencyCustomer === 'CZK') return { ids: 'KB', no: '107-3934450287', code: '0100', symConst: '0308' };
  else return { ids: 'FIOE', no: '2400374721', code: '8330', symConst: '0308' };
};

export const getQaplineDetails = () => {
  return {
    company: 'Qapline spol.',
    name: 'Jindřich',
    surname: 'Machan',
    city: 'Zlín',
    street: 'třída Tomáše Bati',
    number: '299',
    zip: '760 01',
    ico: '29316880',
    dic: 'CZ29316880',
    phone: '774005555',
    email: 'qapline@qapline.com',
  };
};

export const getPaymentType = () => {
  return {
    ids: 'Příkazem',
    type: 'draft',
  };
};

export const parseDate = (unix: string, offset = -120) => {
  if (Number.isNaN(Number(unix))) {
    const splitDate = unix.toString().split('.');
    unix = (moment(`${splitDate[2]}-${splitDate[1]}-${splitDate[0]}`).unix() * 1000).toString();
  }
  return moment
    .unix(Math.floor((Number(unix) - offset * 60000) / 1000))
    .toISOString()
    .split('T')[0];
};

export const getClassificationVAT = (country: string, euCountries: any, noVat = false) => {
  if (noVat) return 'UN';
  if (country === 'CZ') return 'UD';
  if (euCountries.find((country: any) => country === country)) return 'USregEU';

  return 'UD';
};

export const calcPrices = (price: number, vat: string | number) => {
  const vatPercent = isNaN(Number(vat)) ? 0 : Number(vat) / 100;
  const priceVat = price * vatPercent;

  return { price, priceVat, priceSum: price + priceVat };
};

export const getCommissionValues = (commissions: any[]) => {
  let orderDate = Number.MAX_VALUE;
  let dischargeDate = Number.MIN_VALUE;
  let priceNone = 0;
  let priceHigh = 0;
  let priceVatHigh = 0;
  commissions.forEach((item) => {
    if (orderDate > Number(item.orderDate)) {
      orderDate = Number(item.orderDate);
    }
    if (dischargeDate < Number(item.discharge_date[0])) dischargeDate = Number(item.discharge_date[0]);

    const prices = calcPrices(item.priceCustomer, item.vat);
    if (prices.priceVat === 0) priceNone += prices.price;
    else {
      priceHigh += prices.price;
      priceVatHigh += prices.priceVat;
    }
  });

  return { orderDate, dischargeDate, priceNone, priceHigh, priceVatHigh };
};

export const dataPackParams = {
  version: '2.0',
  id: 'Usr01',
  key: 'be836dde-eda7-45ad-b3e8-597b3997beec',
  application: 'Transformace',
  'xmlns:dat': 'http://www.stormware.cz/schema/version_2/data.xsd',
};

export const dataPackItemParams = {
  version: '2.0',
};

export const invoiceParams = {
  version: '2.0',
  'xmlns:inv': 'http://www.stormware.cz/schema/version_2/invoice.xsd',
};

export const invoiceHeaderParams = {
  'xmlns:rsp': 'http://www.stormware.cz/schema/version_2/response.xsd',
  'xmlns:rdc': 'http://www.stormware.cz/schema/version_2/documentresponse.xsd',
  'xmlns:typ': 'http://www.stormware.cz/schema/version_2/type.xsd',
  'xmlns:lst': 'http://www.stormware.cz/schema/version_2/list.xsd',
  'xmlns:lStk': 'http://www.stormware.cz/schema/version_2/list_stock.xsd',
  'xmlns:lAdb': 'http://www.stormware.cz/schema/version_2/list_addBook.xsd',
  'xmlns:lCen': 'http://www.stormware.cz/schema/version_2/list_centre.xsd',
  'xmlns:lAcv': 'http://www.stormware.cz/schema/version_2/list_activity.xsd',
  'xmlns:acu': 'http://www.stormware.cz/schema/version_2/accountingunit.xsd',
  'xmlns:vch': 'http://www.stormware.cz/schema/version_2/voucher.xsd',
  'xmlns:int': 'http://www.stormware.cz/schema/version_2/intDoc.xsd',
  'xmlns:stk': 'http://www.stormware.cz/schema/version_2/stock.xsd',
  'xmlns:ord': 'http://www.stormware.cz/schema/version_2/order.xsd',
  'xmlns:ofr': 'http://www.stormware.cz/schema/version_2/offer.xsd',
  'xmlns:enq': 'http://www.stormware.cz/schema/version_2/enquiry.xsd',
  'xmlns:vyd': 'http://www.stormware.cz/schema/version_2/vydejka.xsd',
  'xmlns:pri': 'http://www.stormware.cz/schema/version_2/prijemka.xsd',
  'xmlns:bal': 'http://www.stormware.cz/schema/version_2/balance.xsd',
  'xmlns:pre': 'http://www.stormware.cz/schema/version_2/prevodka.xsd',
  'xmlns:vyr': 'http://www.stormware.cz/schema/version_2/vyroba.xsd',
  'xmlns:pro': 'http://www.stormware.cz/schema/version_2/prodejka.xsd',
  'xmlns:con': 'http://www.stormware.cz/schema/version_2/contract.xsd',
  'xmlns:adb': 'http://www.stormware.cz/schema/version_2/addressbook.xsd',
  'xmlns:prm': 'http://www.stormware.cz/schema/version_2/parameter.xsd',
  'xmlns:lCon': 'http://www.stormware.cz/schema/version_2/list_contract.xsd',
  'xmlns:ctg': 'http://www.stormware.cz/schema/version_2/category.xsd',
  'xmlns:ipm': 'http://www.stormware.cz/schema/version_2/intParam.xsd',
  'xmlns:str': 'http://www.stormware.cz/schema/version_2/storage.xsd',
  'xmlns:idp': 'http://www.stormware.cz/schema/version_2/individualPrice.xsd',
  'xmlns:sup': 'http://www.stormware.cz/schema/version_2/supplier.xsd',
  'xmlns:prn': 'http://www.stormware.cz/schema/version_2/print.xsd',
  'xmlns:lck': 'http://www.stormware.cz/schema/version_2/lock.xsd',
  'xmlns:isd': 'http://www.stormware.cz/schema/version_2/isdoc.xsd',
  'xmlns:sEET': 'http://www.stormware.cz/schema/version_2/sendEET.xsd',
  'xmlns:act': 'http://www.stormware.cz/schema/version_2/accountancy.xsd',
  'xmlns:bnk': 'http://www.stormware.cz/schema/version_2/bank.xsd',
  'xmlns:sto': 'http://www.stormware.cz/schema/version_2/store.xsd',
  'xmlns:grs': 'http://www.stormware.cz/schema/version_2/groupStocks.xsd',
  'xmlns:acp': 'http://www.stormware.cz/schema/version_2/actionPrice.xsd',
  'xmlns:csh': 'http://www.stormware.cz/schema/version_2/cashRegister.xsd',
  'xmlns:bka': 'http://www.stormware.cz/schema/version_2/bankAccount.xsd',
  'xmlns:ilt': 'http://www.stormware.cz/schema/version_2/inventoryLists.xsd',
  'xmlns:nms': 'http://www.stormware.cz/schema/version_2/numericalSeries.xsd',
  'xmlns:pay': 'http://www.stormware.cz/schema/version_2/payment.xsd',
  'xmlns:mKasa': 'http://www.stormware.cz/schema/version_2/mKasa.xsd',
  'xmlns:gdp': 'http://www.stormware.cz/schema/version_2/GDPR.xsd',
  'xmlns:est': 'http://www.stormware.cz/schema/version_2/establishment.xsd',
  'xmlns:cen': 'http://www.stormware.cz/schema/version_2/centre.xsd',
  'xmlns:acv': 'http://www.stormware.cz/schema/version_2/activity.xsd',
  'xmlns:afp': 'http://www.stormware.cz/schema/version_2/accountingFormOfPayment.xsd',
  'xmlns:vat': 'http://www.stormware.cz/schema/version_2/classificationVAT.xsd',
  'xmlns:rgn': 'http://www.stormware.cz/schema/version_2/registrationNumber.xsd',
  'xmlns:ftr': 'http://www.stormware.cz/schema/version_2/filter.xsd',
  'xmlns:asv': 'http://www.stormware.cz/schema/version_2/accountingSalesVouchers.xsd',
  'xmlns:arch': 'http://www.stormware.cz/schema/version_2/archive.xsd',
  'xmlns:req': 'http://www.stormware.cz/schema/version_2/productRequirement.xsd',
  'xmlns:mov': 'http://www.stormware.cz/schema/version_2/movement.xsd',
  'xmlns:rec': 'http://www.stormware.cz/schema/version_2/recyclingContrib.xsd',
  'xmlns:srv': 'http://www.stormware.cz/schema/version_2/service.xsd',
  'xmlns:rul': 'http://www.stormware.cz/schema/version_2/rulesPairing.xsd',
  'xmlns:lwl': 'http://www.stormware.cz/schema/version_2/liquidationWithoutLink.xsd',
  'xmlns:dis': 'http://www.stormware.cz/schema/version_2/discount.xsd',
  'xmlns:lqd': 'http://www.stormware.cz/schema/version_2/automaticLiquidation.xsd',
};
export const invoiceDetailParams = {
  'xmlns:rsp': 'http://www.stormware.cz/schema/version_2/response.xsd',
  'xmlns:rdc': 'http://www.stormware.cz/schema/version_2/documentresponse.xsd',
  'xmlns:typ': 'http://www.stormware.cz/schema/version_2/type.xsd',
  'xmlns:lst': 'http://www.stormware.cz/schema/version_2/list.xsd',
  'xmlns:lStk': 'http://www.stormware.cz/schema/version_2/list_stock.xsd',
  'xmlns:lAdb': 'http://www.stormware.cz/schema/version_2/list_addBook.xsd',
  'xmlns:lCen': 'http://www.stormware.cz/schema/version_2/list_centre.xsd',
  'xmlns:lAcv': 'http://www.stormware.cz/schema/version_2/list_activity.xsd',
  'xmlns:acu': 'http://www.stormware.cz/schema/version_2/accountingunit.xsd',
  'xmlns:vch': 'http://www.stormware.cz/schema/version_2/voucher.xsd',
  'xmlns:int': 'http://www.stormware.cz/schema/version_2/intDoc.xsd',
  'xmlns:stk': 'http://www.stormware.cz/schema/version_2/stock.xsd',
  'xmlns:ord': 'http://www.stormware.cz/schema/version_2/order.xsd',
  'xmlns:ofr': 'http://www.stormware.cz/schema/version_2/offer.xsd',
  'xmlns:enq': 'http://www.stormware.cz/schema/version_2/enquiry.xsd',
  'xmlns:vyd': 'http://www.stormware.cz/schema/version_2/vydejka.xsd',
  'xmlns:pri': 'http://www.stormware.cz/schema/version_2/prijemka.xsd',
  'xmlns:bal': 'http://www.stormware.cz/schema/version_2/balance.xsd',
  'xmlns:pre': 'http://www.stormware.cz/schema/version_2/prevodka.xsd',
  'xmlns:vyr': 'http://www.stormware.cz/schema/version_2/vyroba.xsd',
  'xmlns:pro': 'http://www.stormware.cz/schema/version_2/prodejka.xsd',
  'xmlns:con': 'http://www.stormware.cz/schema/version_2/contract.xsd',
  'xmlns:adb': 'http://www.stormware.cz/schema/version_2/addressbook.xsd',
  'xmlns:prm': 'http://www.stormware.cz/schema/version_2/parameter.xsd',
  'xmlns:lCon': 'http://www.stormware.cz/schema/version_2/list_contract.xsd',
  'xmlns:ctg': 'http://www.stormware.cz/schema/version_2/category.xsd',
  'xmlns:ipm': 'http://www.stormware.cz/schema/version_2/intParam.xsd',
  'xmlns:str': 'http://www.stormware.cz/schema/version_2/storage.xsd',
  'xmlns:idp': 'http://www.stormware.cz/schema/version_2/individualPrice.xsd',
  'xmlns:sup': 'http://www.stormware.cz/schema/version_2/supplier.xsd',
  'xmlns:prn': 'http://www.stormware.cz/schema/version_2/print.xsd',
  'xmlns:lck': 'http://www.stormware.cz/schema/version_2/lock.xsd',
  'xmlns:isd': 'http://www.stormware.cz/schema/version_2/isdoc.xsd',
  'xmlns:sEET': 'http://www.stormware.cz/schema/version_2/sendEET.xsd',
  'xmlns:act': 'http://www.stormware.cz/schema/version_2/accountancy.xsd',
  'xmlns:bnk': 'http://www.stormware.cz/schema/version_2/bank.xsd',
  'xmlns:sto': 'http://www.stormware.cz/schema/version_2/store.xsd',
  'xmlns:grs': 'http://www.stormware.cz/schema/version_2/groupStocks.xsd',
  'xmlns:acp': 'http://www.stormware.cz/schema/version_2/actionPrice.xsd',
  'xmlns:csh': 'http://www.stormware.cz/schema/version_2/cashRegister.xsd',
  'xmlns:bka': 'http://www.stormware.cz/schema/version_2/bankAccount.xsd',
  'xmlns:ilt': 'http://www.stormware.cz/schema/version_2/inventoryLists.xsd',
  'xmlns:nms': 'http://www.stormware.cz/schema/version_2/numericalSeries.xsd',
  'xmlns:pay': 'http://www.stormware.cz/schema/version_2/payment.xsd',
  'xmlns:mKasa': 'http://www.stormware.cz/schema/version_2/mKasa.xsd',
  'xmlns:gdp': 'http://www.stormware.cz/schema/version_2/GDPR.xsd',
  'xmlns:est': 'http://www.stormware.cz/schema/version_2/establishment.xsd',
  'xmlns:cen': 'http://www.stormware.cz/schema/version_2/centre.xsd',
  'xmlns:acv': 'http://www.stormware.cz/schema/version_2/activity.xsd',
  'xmlns:afp': 'http://www.stormware.cz/schema/version_2/accountingFormOfPayment.xsd',
  'xmlns:vat': 'http://www.stormware.cz/schema/version_2/classificationVAT.xsd',
  'xmlns:rgn': 'http://www.stormware.cz/schema/version_2/registrationNumber.xsd',
  'xmlns:ftr': 'http://www.stormware.cz/schema/version_2/filter.xsd',
  'xmlns:asv': 'http://www.stormware.cz/schema/version_2/accountingSalesVouchers.xsd',
  'xmlns:arch': 'http://www.stormware.cz/schema/version_2/archive.xsd',
  'xmlns:req': 'http://www.stormware.cz/schema/version_2/productRequirement.xsd',
  'xmlns:mov': 'http://www.stormware.cz/schema/version_2/movement.xsd',
  'xmlns:rec': 'http://www.stormware.cz/schema/version_2/recyclingContrib.xsd',
  'xmlns:srv': 'http://www.stormware.cz/schema/version_2/service.xsd',
  'xmlns:rul': 'http://www.stormware.cz/schema/version_2/rulesPairing.xsd',
  'xmlns:lwl': 'http://www.stormware.cz/schema/version_2/liquidationWithoutLink.xsd',
  'xmlns:dis': 'http://www.stormware.cz/schema/version_2/discount.xsd',
  'xmlns:lqd': 'http://www.stormware.cz/schema/version_2/automaticLiquidation.xsd',
};

export const invoiceSummaryParams = {
  'xmlns:rsp': 'http://www.stormware.cz/schema/version_2/response.xsd',
  'xmlns:rdc': 'http://www.stormware.cz/schema/version_2/documentresponse.xsd',
  'xmlns:typ': 'http://www.stormware.cz/schema/version_2/type.xsd',
  'xmlns:lst': 'http://www.stormware.cz/schema/version_2/list.xsd',
  'xmlns:lStk': 'http://www.stormware.cz/schema/version_2/list_stock.xsd',
  'xmlns:lAdb': 'http://www.stormware.cz/schema/version_2/list_addBook.xsd',
  'xmlns:lCen': 'http://www.stormware.cz/schema/version_2/list_centre.xsd',
  'xmlns:lAcv': 'http://www.stormware.cz/schema/version_2/list_activity.xsd',
  'xmlns:acu': 'http://www.stormware.cz/schema/version_2/accountingunit.xsd',
  'xmlns:vch': 'http://www.stormware.cz/schema/version_2/voucher.xsd',
  'xmlns:int': 'http://www.stormware.cz/schema/version_2/intDoc.xsd',
  'xmlns:stk': 'http://www.stormware.cz/schema/version_2/stock.xsd',
  'xmlns:ord': 'http://www.stormware.cz/schema/version_2/order.xsd',
  'xmlns:ofr': 'http://www.stormware.cz/schema/version_2/offer.xsd',
  'xmlns:enq': 'http://www.stormware.cz/schema/version_2/enquiry.xsd',
  'xmlns:vyd': 'http://www.stormware.cz/schema/version_2/vydejka.xsd',
  'xmlns:pri': 'http://www.stormware.cz/schema/version_2/prijemka.xsd',
  'xmlns:bal': 'http://www.stormware.cz/schema/version_2/balance.xsd',
  'xmlns:pre': 'http://www.stormware.cz/schema/version_2/prevodka.xsd',
  'xmlns:vyr': 'http://www.stormware.cz/schema/version_2/vyroba.xsd',
  'xmlns:pro': 'http://www.stormware.cz/schema/version_2/prodejka.xsd',
  'xmlns:con': 'http://www.stormware.cz/schema/version_2/contract.xsd',
  'xmlns:adb': 'http://www.stormware.cz/schema/version_2/addressbook.xsd',
  'xmlns:prm': 'http://www.stormware.cz/schema/version_2/parameter.xsd',
  'xmlns:lCon': 'http://www.stormware.cz/schema/version_2/list_contract.xsd',
  'xmlns:ctg': 'http://www.stormware.cz/schema/version_2/category.xsd',
  'xmlns:ipm': 'http://www.stormware.cz/schema/version_2/intParam.xsd',
  'xmlns:str': 'http://www.stormware.cz/schema/version_2/storage.xsd',
  'xmlns:idp': 'http://www.stormware.cz/schema/version_2/individualPrice.xsd',
  'xmlns:sup': 'http://www.stormware.cz/schema/version_2/supplier.xsd',
  'xmlns:prn': 'http://www.stormware.cz/schema/version_2/print.xsd',
  'xmlns:lck': 'http://www.stormware.cz/schema/version_2/lock.xsd',
  'xmlns:isd': 'http://www.stormware.cz/schema/version_2/isdoc.xsd',
  'xmlns:sEET': 'http://www.stormware.cz/schema/version_2/sendEET.xsd',
  'xmlns:act': 'http://www.stormware.cz/schema/version_2/accountancy.xsd',
  'xmlns:bnk': 'http://www.stormware.cz/schema/version_2/bank.xsd',
  'xmlns:sto': 'http://www.stormware.cz/schema/version_2/store.xsd',
  'xmlns:grs': 'http://www.stormware.cz/schema/version_2/groupStocks.xsd',
  'xmlns:acp': 'http://www.stormware.cz/schema/version_2/actionPrice.xsd',
  'xmlns:csh': 'http://www.stormware.cz/schema/version_2/cashRegister.xsd',
  'xmlns:bka': 'http://www.stormware.cz/schema/version_2/bankAccount.xsd',
  'xmlns:ilt': 'http://www.stormware.cz/schema/version_2/inventoryLists.xsd',
  'xmlns:nms': 'http://www.stormware.cz/schema/version_2/numericalSeries.xsd',
  'xmlns:pay': 'http://www.stormware.cz/schema/version_2/payment.xsd',
  'xmlns:mKasa': 'http://www.stormware.cz/schema/version_2/mKasa.xsd',
  'xmlns:gdp': 'http://www.stormware.cz/schema/version_2/GDPR.xsd',
  'xmlns:est': 'http://www.stormware.cz/schema/version_2/establishment.xsd',
  'xmlns:cen': 'http://www.stormware.cz/schema/version_2/centre.xsd',
  'xmlns:acv': 'http://www.stormware.cz/schema/version_2/activity.xsd',
  'xmlns:afp': 'http://www.stormware.cz/schema/version_2/accountingFormOfPayment.xsd',
  'xmlns:vat': 'http://www.stormware.cz/schema/version_2/classificationVAT.xsd',
  'xmlns:rgn': 'http://www.stormware.cz/schema/version_2/registrationNumber.xsd',
  'xmlns:ftr': 'http://www.stormware.cz/schema/version_2/filter.xsd',
  'xmlns:asv': 'http://www.stormware.cz/schema/version_2/accountingSalesVouchers.xsd',
  'xmlns:arch': 'http://www.stormware.cz/schema/version_2/archive.xsd',
  'xmlns:req': 'http://www.stormware.cz/schema/version_2/productRequirement.xsd',
  'xmlns:mov': 'http://www.stormware.cz/schema/version_2/movement.xsd',
  'xmlns:rec': 'http://www.stormware.cz/schema/version_2/recyclingContrib.xsd',
  'xmlns:srv': 'http://www.stormware.cz/schema/version_2/service.xsd',
  'xmlns:rul': 'http://www.stormware.cz/schema/version_2/rulesPairing.xsd',
  'xmlns:lwl': 'http://www.stormware.cz/schema/version_2/liquidationWithoutLink.xsd',
  'xmlns:dis': 'http://www.stormware.cz/schema/version_2/discount.xsd',
  'xmlns:lqd': 'http://www.stormware.cz/schema/version_2/automaticLiquidation.xsd',
};
