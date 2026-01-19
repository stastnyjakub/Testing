import { SYSTEM_NOTIFICATIONS_USER_IDS } from '@/config/constants';
import env from '@/env';
import * as notificationService from '@/notifications/notifications.service';

import { TNotifyAdminsAboutGroupedPaymentArgs, TNotifyAdminsAboutNotMatchingPaymentArgs } from '../types';

export const notifyAdminsAboutGroupedPayment = async ({
  invoices,
  transaction,
}: TNotifyAdminsAboutGroupedPaymentArgs) => {
  const recipients = SYSTEM_NOTIFICATIONS_USER_IDS;
  const invoiceNumbers = invoices.map(({ invoiceNumber }) => String(invoiceNumber)).join(', ');
  const invoiceLinks = invoices
    .map(
      ({ invoice_id, invoiceNumber }) =>
        `<strong><a href="${env().CO_URL}/invoicing/${invoice_id}">${invoiceNumber}</a></strong>`,
    )
    .join(', ');

  await notificationService.sendNotification({
    userIds: recipients,
    subject: `Problém se sdruženou platbou pro faktury ${invoiceNumbers}`,
    title: `Nevyhovující sdružená platba pro faktury`,
    message: `
        Systém zaznamenal sdruženou platbu pro tyto faktury ${invoiceLinks}, ale částka se neshoduje s celkovou částkou faktur.
        <br>
        Je třeba manuální zpracování.
        <br><br>
        Platba byla zaznamenána <strong>${transaction.date.tz('Europe/Prague').format('DD. MM. YYYY')}</strong> ve výši <strong>${transaction.amount} ${transaction.currency}</strong>.
      `,
  });
};

export const notifyAdminsAboutNotMatchingPayment = async ({
  invoiceId,
  invoiceNumber,
}: TNotifyAdminsAboutNotMatchingPaymentArgs) => {
  const recipients = SYSTEM_NOTIFICATIONS_USER_IDS;
  await notificationService.sendNotification({
    userIds: recipients,
    subject: `Problém s platbou faktury ${invoiceNumber}`,
    title: `Nevyhovující platba faktury ${invoiceNumber}`,
    message: `Systém zaznamenal platbu pro fakturu <strong><a href="${env().CO_URL}/invoicing/${invoiceId}">${invoiceNumber}</a></strong>, ale částka se neshoduje s celkovou částkou faktury.<br><br>Prosím zkontrolujte platbu. V případě, že je platba správná, označte fakturu jako zaplacenou.`,
  });
};
