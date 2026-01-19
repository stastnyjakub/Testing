import { Prisma } from '@prisma/client';

import prisma from '@/db/client';

import { createCustomerOld } from '../customer.service';
import { TCreateCustomerArgs } from '../types/arguments';

export const getOrCreateCustomerForEnquiry = async (
  { customer, locations, customerContacts }: TCreateCustomerArgs,
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  let customerId: number | null = null;

  // Customers from enquiry form are named by their email
  // Completed customer will be renamed and email will be in email field
  const customerWithSameName = await transactionClient.customer.findFirst({
    where: {
      OR: [{ name: customer.name }, { billingEmail: customer.billingEmail }],
    },
  });
  if (customerWithSameName) customerId = customerWithSameName.customer_id;

  // There is a possibility that there is contact with the same email as customer
  if (!customerId) {
    const customerWithDispatcherWithSameEmail = await transactionClient.customerContact.findFirst({
      include: {
        customer: true,
      },
      where: {
        email: customer.billingEmail,
      },
    });
    customerWithDispatcherWithSameEmail?.customer &&
      (customerId = customerWithDispatcherWithSameEmail.customer.customer_id);
  }

  // If customer exists, check if locations exist and create them if not
  // Return customer with locations
  if (customerId) {
    await checkAndCreateLocations(customerId, locations[0], locations[1], transactionClient);
    return await transactionClient.customer.findFirst({
      where: {
        customer_id: customerId,
      },
      include: {
        location: true,
        customerContacts: true,
      },
    });
  }

  // If customer does not exist, create it with locations and contacts
  const createdCustomer = await createCustomerOld(
    {
      customer: customer,
      locations: locations,
      customerContacts: customerContacts,
    },
    transactionClient,
  );
  return createdCustomer;
};

// Check if loading and discharge locations exist and create them if not
const checkAndCreateLocations = async (
  customerId: number,
  loadingLocation: TCreateCustomerArgs['locations'][number],
  dischargeLocation: TCreateCustomerArgs['locations'][number],
  transactionClient: Prisma.TransactionClient = prisma,
) => {
  const loadingLocationExists = await transactionClient.location.findFirst({
    where: {
      customer_id: customerId,
      longitude: loadingLocation.longitude,
      latitude: loadingLocation.latitude,
    },
  });
  // If location exists and is not loading, update it to loading
  if (loadingLocationExists && loadingLocationExists.loading === false) {
    await transactionClient.location.update({
      where: {
        location_id: loadingLocationExists.location_id,
      },
      data: {
        loading: true,
      },
    });
  }

  const dischargeLocationExists = await transactionClient.location.findFirst({
    where: {
      customer_id: customerId,
      longitude: dischargeLocation.longitude,
      latitude: dischargeLocation.latitude,
    },
  });
  // If location exists and is not discharge, update it to discharge
  if (dischargeLocationExists && dischargeLocationExists.discharge === false) {
    await transactionClient.location.update({
      where: {
        location_id: dischargeLocationExists.location_id,
      },
      data: {
        discharge: true,
      },
    });
  }

  // If location does not exist, create it
  if (!loadingLocationExists || !dischargeLocationExists) {
    await transactionClient.location.createMany({
      data: [
        ...(loadingLocationExists
          ? []
          : [
              {
                ...loadingLocation,
                customer_id: customerId,
              },
            ]),
        ...(dischargeLocationExists
          ? []
          : [
              {
                ...dischargeLocation,
                customer_id: customerId,
              },
            ]),
      ],
    });
  }
};
