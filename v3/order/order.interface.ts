import { Lang } from '@/types';

interface Substitutions {
  qid: string;
  carrierDispatcherName: string;
  carrierCompany: string;
  carrierDispatcherGsm: string;
  carrierStreet: string;
  carrierDispatcherEmail: string;
  carrierCountry: string;
  carrierPostalCode: string;
  carrierCity: string;
  carrierDriver: string;
  carrierRegistrationNumber: string;
  carrierGsm: string;
  carrierTaxNumber: string;
  carrierRegistrationPlate: string;
  loadingNumber: number;
  loadingDate: string;
  loadingTime: string;
  dischargeNumber: number;
  dischargeDate: string;
  dischargeTime: string;
  loadingCompany: string;
  dischargeCompany: string;
  loadingStreet: string;
  dischargeStreet: string;
  loadingCountry: string;
  loadingPostalCode: string;
  loadingCity: string;
  dischargeCountry: string;
  dischargePostalCode: string;
  dischargeCity: string;
  loadingGps: string;
  dischargeGps: string;
  loadingRefNumber: string;
  dischargeRefNumber: string;
  itemLoading: string;
  itemDischarge: string;
  itemName: string;
  itemPackage: string;
  itemQuantity: string;
  itemSize: string;
  itemLoadingMeters: string;
  itemWeight: string;
  itemWeightBrutto: string;
  disposition: string;
  carrierPrice: number;
  orderCurrency: 'CZK' | 'EUR';
  date: string;
  createdBy: string;
  createdByPhoneNumber: string;
}

export interface CreateOrderRequest extends Substitutions {
  lang: Lang;
}

export interface ConfirmationEmailOrderData {
  qid: string;
  itemName: string;
  itemPackage: string;
  itemWeight: string;
  itemLoadingMeters: string;
  loadingDate: string;
  loadingAddress: string;
  dischargeAddress: string;
  dischargeDate: string;
  carrierPrice: string;
  driverPhone: string;
  carrierRegistrationPlate: string;
}
