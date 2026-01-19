import * as Sentry from '@sentry/node';

import { QaplineBillingInfo, USERS } from '@/config/constants';
import * as mailService from '@/mail/mail.service';
import { t } from '@/middleware/i18n';
import { ECurrency, Lang } from '@/types';
import * as userService from '@/user/user.service';
import { TwigTemplate } from '@/utils';

import { TInvoicePaymentReminderEmailData } from '../types';

import { increaseInvoicePaymentReminderCount } from './invoicePaymentReminder.service';

export type TSendInvoicePaymentRemindersToCustomersArgs = {
  invoices: {
    customerId: number;
    customerEmail: string;
    customerLang: Lang;
    invoiceId: number;
    invoiceNumber: number;
    price: number;
    currency: ECurrency;
    issueDate: moment.Moment;
    dueDate: moment.Moment;
    attempt: 'first' | 'repeated';
  }[];
};
export const sendInvoicePaymentRemindersToCustomers = async ({
  invoices,
}: TSendInvoicePaymentRemindersToCustomersArgs) => {
  const emailPromises = invoices.map(async (invoice) => {
    const { customerEmail, invoiceId, invoiceNumber, attempt } = invoice;
    try {
      await sendInvoicePaymentReminderToCustomer(invoice);
      await increaseInvoicePaymentReminderCount(invoiceId);
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          invoiceNumber,
          customerEmail,
          attempt,
        },
      });
      throw error;
    }
  });

  return await Promise.allSettled(emailPromises);
};

export const sendInvoicePaymentReminderToCustomer = async ({
  currency,
  customerLang,
  dueDate,
  invoiceNumber,
  issueDate,
  price,
  customerEmail,
  attempt,
}: TSendInvoicePaymentRemindersToCustomersArgs['invoices'][number]) => {
  const twigTemplate = new TwigTemplate<TInvoicePaymentReminderEmailData>(customerLang);
  let subject = '';

  if (attempt === 'repeated') {
    await twigTemplate.setTemplate('templates/email/repeatedInvoicePaymentReminder/index.twig');
    subject = t('repeatedInvoicePaymentReminderMail.subject', customerLang);
  } else {
    await twigTemplate.setTemplate('templates/email/invoicePaymentReminder/index.twig');
    subject = t('invoicePaymentReminderMail.subject', customerLang);
  }

  const operatingDispatcher = await userService.getQaplineUserInfoForEmail(USERS.JindraMachan.id);
  const body = await twigTemplate.render({
    price: price,
    bankAccount: `${QaplineBillingInfo.bank.CZK.accountNumber}/${QaplineBillingInfo.bank.CZK.bankCode}`,
    currency: t(`common.currency.${currency}`, customerLang),
    dueDate: dueDate.unix(),
    issueDate: issueDate.unix(),
    invoiceNumber: invoiceNumber,
    dispatcher: operatingDispatcher,
  });

  await mailService.sendMail({
    body,
    subject,
    attachments: [],
    lang: customerLang,
    to: [customerEmail],
    sender: operatingDispatcher,
  });
};
