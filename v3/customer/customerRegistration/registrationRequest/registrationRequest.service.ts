import { EAuthRole } from '@/auth/types';
import * as customerService from '@/customer/customer.service';
import * as customerContactService from '@/customer/customerContact/customerContact.service';
import * as customerUserService from '@/customer/customerUser/customerUser.service';
import { HttpException } from '@/errors';
import { EHttpStatusCode } from '@/types';
import * as userService from '@/user/user.service';
import { performTransaction } from '@/utils';

import { deleteCustomerRegistration } from '../deleteCustomerRegistration/deleteCustomerRegistration.service';
import { getCustomerRegistration } from '../getCustomerRegistration/getCustomerRegistration.service';

import { notifyCustomerAlreadyRegistered } from './alreadyRegistered';
import { createRegistration } from './createRegistration';
import { TProcessRegistrationRequestArgs } from './registrationRequest.types';
import { notifyUnknownUser } from './unknownUser';

export const processRegistrationRequest = async (args: TProcessRegistrationRequestArgs) => {
  const { companyIdentification, email, lang } = args;
  const existingUser = await userService.getUser({ email });
  if (existingUser) {
    throw new HttpException(EHttpStatusCode.BadRequest, 'registration.alreadyExists');
  }
  const existingRegistration = await getCustomerRegistration({ email });
  const existingCustomer = await customerService.getCustomer({ companyRegistrationNumber: companyIdentification });

  await performTransaction(async (transactionClient) => {
    if (existingRegistration) {
      await deleteCustomerRegistration(existingRegistration.customerRegistration_id, transactionClient);
    }

    // If there is no existing customer, we want to proceed with creating a new registration.
    if (!existingCustomer) {
      return await createRegistration(args, transactionClient);
    }
    const customerId = existingCustomer.customer_id;

    // Find user with CustomerOwner role
    const customerUsers = await customerUserService.listCustomerUsers({ customerId });
    const customerOwnerUser = customerUsers.find(({ user: { userRoles } }) =>
      userRoles.some(({ role: { name } }) => name === EAuthRole.CustomerOwner),
    );

    // It the customer exists and has a CustomerOwner, then its registered and all other users need to be invited.
    if (customerOwnerUser) {
      return await notifyCustomerAlreadyRegistered({
        customerOwnerEmail: customerOwnerUser.user.email,
        email,
        lang,
      });
    }

    // Check if the email exists in customer contacts
    const customerContacts = await customerContactService.listCustomerContacts({ customerId });
    const existingContact = customerContacts.find(
      ({ email: contactEmail }) => contactEmail && contactEmail.toLowerCase() === email.toLowerCase(),
    );

    // The the customer exists, but is not registered, we allow users with email in contacts to register.
    if (existingContact) {
      return await createRegistration(
        { ...args, customerId, customerContactId: existingContact.customerContact_id },
        transactionClient,
      );
    }

    // If the customer exists, but the email is not in contacts, we notify the user that they are unknown and cannot register.
    return await notifyUnknownUser({ email, lang });
  });
};
