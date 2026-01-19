import prisma from '@/db/client';

export const getCustomerContact = async (customerContactId: number) => {
  const customerContact = await prisma.customerContact.findUnique({
    where: {
      customerContact_id: customerContactId,
    },
  });

  return customerContact;
};
