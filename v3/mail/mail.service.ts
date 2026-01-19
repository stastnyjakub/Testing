import mailer from '@sendgrid/mail';

import env from '@/env';

import { getFile } from '../file/file.service';

import { determineBcc, getFakeEmailResponse, getMailDataAttachments, getShouldSendEmail } from './mail.helpers';
import { TMail } from './mail.interface';

mailer.setApiKey(env().SENDGRID_API_KEY);

export const sendMail = async ({ attachments, body, sender, subject, to, bcc: bccArg, internal = false }: TMail) => {
  const filePromises = attachments.map(async ({ path, name }) => {
    const file = await getFile(path);
    if (name) file.filename = name;
    return file;
  });
  const files = await Promise.all(filePromises);

  const mailDataAttachments = getMailDataAttachments(files);
  const bcc = determineBcc({ senderEmail: sender.email, bcc: bccArg, internal });

  const sendPromises = to.map(async (email) => {
    const shouldSend = getShouldSendEmail(email);
    if (!shouldSend) return getFakeEmailResponse();

    const mailData: mailer.MailDataRequired = {
      from: {
        name: 'Qapline',
        email: sender.email,
      },
      to: email,
      subject: subject,
      html: body,
      bcc,
      attachments: mailDataAttachments,
    };
    const [res] = await mailer.send(mailData);
    return res;
  });
  const sendResults = await Promise.allSettled(sendPromises);

  const { successfulEmails, rejectedEmails } = sendResults.reduce(
    (acc, { status }, idx) => {
      if (status === 'fulfilled') {
        acc.successfulEmails.push(to[idx]);
      } else {
        acc.rejectedEmails.push(to[idx]);
      }
      return acc;
    },
    { successfulEmails: [] as string[], rejectedEmails: [] as string[] },
  );

  return {
    successfulEmails,
    rejectedEmails,
  };
};
