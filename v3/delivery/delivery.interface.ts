import { Lang } from '../types';

export interface Substitutions {
  customerCompany: string;
  items: string;
  dischargeDate: string;
  dischargeTime: string;
  carrierRegistrationPlate: string;
  carrierDriver: string;
  carrierGsm: string;
}

export interface CreateDeliveryRequest extends Substitutions {
  qid: string;
  lang: Lang;
}
