import axios from 'axios';
import FormData from 'form-data';

import env from '@/env';

export enum ProcessorType {
  HTML = '/forms/chromium/convert/html',
  XLSX = '/forms/libreoffice/convert',
}

export const generatePdf = async (form: FormData, type: ProcessorType): Promise<Buffer> => {
  const resp = await axios.post(env().PDF_PROCESSOR_URL + type, form, {
    responseType: 'stream',
    headers: { ...form.getHeaders() },
  });

  const parts = [];
  for await (const data of resp.data) {
    parts.push(data);
  }

  return Buffer.concat(parts);
};
