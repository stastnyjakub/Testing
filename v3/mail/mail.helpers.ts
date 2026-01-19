import mailer from '@sendgrid/mail';
import moment from 'moment';

import env from '@/env';
import { getFile } from '@/file/file.service';
import { AsyncReturnType } from '@/types';

export const getShouldSendEmail = (email: string) => {
  if (env().ENVIRONMENT === 'prod') return true;
  return Boolean(isEmailInKoalaDomain(email));
};

export const getFakeEmailResponse = (): mailer.ClientResponse | null => {
  return {
    statusCode: 202,
    body: {},
    headers: {
      server: 'nginx',
      date: moment().format('ddd, DD MMM YYYY HH:mm:ss [GMT]'),
      'content-length': '0',
      connection: 'close',
      'x-message-id': 'fake-response',
      'access-control-allow-origin': 'https://sendgrid.api-docs.io',
      'access-control-allow-methods': 'POST',
      'access-control-allow-headers': 'Authorization, Content-Type, On-behalf-of, x-sg-elas-acl',
      'access-control-max-age': '600',
      'x-no-cors-reason': 'https://sendgrid.com/docs/Classroom/Basics/API/cors.html',
      'strict-transport-security': 'max-age=600; includeSubDomains',
    },
  };
};

export const isEmailInKoalaDomain = (email: string) => {
  const [_, domain] = email.split('@');
  return domain === 'koala42.com';
};

export type TDetermineBccArgs = {
  internal?: boolean;
  bcc?: string[];
  senderEmail: string;
};

export const determineBcc = ({ bcc, internal, senderEmail }: TDetermineBccArgs) => {
  if (env().ENVIRONMENT !== 'prod') return [];
  if (internal) return [];
  if (bcc) return bcc;

  return [senderEmail];
};

export const getMailDataAttachments = (files: AsyncReturnType<typeof getFile>[]) => {
  return files.map(
    ({ filename, content, contentType }): NonNullable<mailer.MailDataRequired['attachments']>[number] => ({
      filename: filename ?? 'attachment',
      disposition: 'attachment',
      content: content.toString('base64'),
      type: contentType,
    }),
  );
};
