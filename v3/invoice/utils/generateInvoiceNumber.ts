import prisma from '../../db/client';

export const generateInvoiceNumber = async () => {
  const currentYear = new Date().getFullYear().toString().substring(2);
  const padding = `00000000`;
  let newNumberSuffix: number;

  try {
    const lastInvoice = await prisma.invoice.findFirst({
      select: {
        invoiceNumber: true,
      },
      where: {
        invoiceNumber: {
          not: null,
          gt: Number(`${currentYear}000000`),
          lt: Number(`${Number(currentYear) + 1}000000`),
        },

        deleted: false, // ensure only undeleted invoices are considered when generating a number
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
      take: 1,
    });
    if (lastInvoice === null) throw new Error('No last invoice found for the current year');

    const lastInvoiceNumber = lastInvoice.invoiceNumber;
    if (lastInvoiceNumber === null) throw new Error('Last invoice number is null');

    const yearPrefix = lastInvoiceNumber.toString().substring(0, 2);
    const numberSuffix = lastInvoiceNumber.toString().substring(2);

    if (yearPrefix === currentYear) {
      newNumberSuffix = parseInt(numberSuffix) + 1;
    } else {
      newNumberSuffix = 1;
    }
  } catch (e) {
    newNumberSuffix = 1;
  }
  const newInvoiceNumber = parseInt(currentYear + (padding + newNumberSuffix).slice(-6));
  return newInvoiceNumber;
};
