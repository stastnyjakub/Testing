import { Prisma } from '@prisma/client';

export const getCommissionsInvoicingSelect = (): Prisma.commissionSelect => {
  return {
    commission_id: true,
    number: true,
    vat: true,
    orderDate: true,
    qid: true,
    customer: {
      select: {
        customer_id: true,
        name: true,
      },
    },
    commissionloading: {
      select: {
        date: true,
        location: {
          select: {
            city: true,
            country: true,
            countryCode: true,
            postalCode: true,
            street: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    },
    commissiondischarge: {
      select: {
        date: true,
        location: {
          select: {
            city: true,
            country: true,
            countryCode: true,
            postalCode: true,
            street: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    },

    // To calculate the total price in CZK
    priceCustomer: true,
    currencyCustomer: true,
    exchangeRateCustomer: true,
  } as const;
};
