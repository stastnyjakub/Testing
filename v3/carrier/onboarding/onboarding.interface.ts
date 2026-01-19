export interface OnboardingEmailBody {
  to: {
    email: string;
    lang: string;
    dispatcher_id?: number;
  }[];
  carrier_id: number;
  dispatcher: {
    name: string;
    email: string;
    phone: string;
    surname: string;
  };
}
