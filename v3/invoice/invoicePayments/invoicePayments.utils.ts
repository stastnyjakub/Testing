import { commission, invoice } from '@prisma/client';

import { TBankTransaction } from '@/bank/types';
import { ECurrency } from '@/types';

import { calculateTotalPriceForInvoice } from '../utils/calculateTotalPriceForInvoice';

export const extractVariableSymbolsFromTransactions = (transactions: TBankTransaction[]) => {
  return transactions
    .flatMap(({ variableSymbols }) =>
      variableSymbols ? variableSymbols.map((variableSymbol) => Number(variableSymbol)) : [],
    )
    .filter((variableSymbol) => variableSymbol);
};

export const groupInvoicesWithTransactions = <Invoice extends Pick<invoice, 'invoiceNumber'>>(
  invoices: Invoice[],
  transactions: TBankTransaction[],
) => {
  const groupedInvoices = transactions.reduce<{ transaction: TBankTransaction; invoices: Invoice[] }[]>(
    (prev, curr) => {
      const associatedInvoices = invoices.filter(({ invoiceNumber }) =>
        curr.variableSymbols?.includes(String(invoiceNumber)),
      );
      if (associatedInvoices.length === 0) return prev;
      prev.push({
        transaction: curr,
        invoices: associatedInvoices,
      });
      return prev;
    },
    [],
  );
  return groupedInvoices;
};

export const getTotalPriceFromInvoiceCommissions = (commissions: commission[]) => {
  const totalPrice = calculateTotalPriceForInvoice({
    commissions: commissions.map((commission) => {
      const { currencyCustomer, priceCustomer, vat } = commission;

      if (!currencyCustomer || !priceCustomer || !vat) {
        throw new Error('Cannot calculate total price for invoice: commission is missing data', {
          cause: commission,
        });
      }
      return {
        currencyCustomer: currencyCustomer as ECurrency,
        priceCustomer: Number(priceCustomer),
        vat: Number(vat),
      };
    }),
  });

  return totalPrice;
};
