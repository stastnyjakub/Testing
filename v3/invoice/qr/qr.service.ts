import * as Sentry from '@sentry/node';
import axios from 'axios';

import { arrayBufferToBase64 } from '@/utils';

import { InvoiceData } from './qr.types';

export const getQRCode = async (invoiceData: InvoiceData) => {
  try {
    const res = await axios<ArrayBuffer>({
      method: 'GET',
      url: 'https://api.qrfgen.cz/generator/image',
      params: invoiceData,
      responseType: 'arraybuffer',
    });
    return arrayBufferToBase64(res.data);
  } catch (e) {
    Sentry.captureException(e);
  }
  return '';
};
