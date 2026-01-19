import { TMailSender } from '@/mail/mail.interface';

export type TCustomerRegistrationEmail = {
  registrationLink: string;
};
export type TCustomerAlreadyRegisteredEmail = {
  customerOwnerEmail: string;
};
export type TUnknownUserEmail = {
  dispatcher: TMailSender;
};

export * from './request';
