import { Lang } from '../types';

export interface Substitutions {
  customerCompany: string;
  items: string;
  loadingDate: string;
  loadingTime: string;
  carrierRegistrationPlate: string;
  carrierDriver: string;
  carrierGsm: string;
  loadingRefNumber: string;
}

export interface CreateDeliveryRequest extends Substitutions {
  qid: string;
  lang: Lang;
}
