import * as customerService from '@/customer/customer.service';
import * as customerContactService from '@/customer/customerContact/customerContact.service';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as languageService from '@/language/language.service';
import { performTransaction } from '@/utils';

import { queueSendRegistrationEmail } from '../customerRegistration.service';
import { createRegistration } from '../registrationRequest/createRegistration';

export type TInviteCustomerArgs = {
  customerContactId: number;
};
export const inviteCustomer = async ({ customerContactId }: TInviteCustomerArgs) => {
  const customerContact = await customerContactService.getCustomerContact(customerContactId);
  if (!customerContact) throw new NotFoundException(Entity.CUSTOMER_CONTACT);
  const customer = await customerService.getCustomer({ customerId: customerContact.customer_id });
  if (!customer) throw new NotFoundException(Entity.CUSTOMER);
  const { countryCode, companyRegistrationNumber } = customer;
  const { email } = customerContact;

  if (!email) throw new HttpException(400, 'customerContact.missingEmail');
  if (!companyRegistrationNumber) throw new HttpException(400, 'customer.missingCompanyRegistrationNumber');
  if (!countryCode) throw new HttpException(400, 'customer.missingCountryCode');
  const lang = await languageService.getLanguageForCountry(countryCode);
  if (!lang) throw new HttpException(500, 'customer.cannotDetermineLanguage');

  await performTransaction(async (transactionClient) => {
    const { customerRegistration_id } = await createRegistration(
      {
        companyIdentification: companyRegistrationNumber,
        email,
        lang,
        //TODO: generate random safe password and give it to receiver by mail
        password: '1234',
      },
      transactionClient,
    );
    await queueSendRegistrationEmail({ customerRegistrationId: customerRegistration_id, invitation: true });
  });
};
