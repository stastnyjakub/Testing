import FormData from 'form-data';
import fs from 'fs';

import { generatePdf, ProcessorType } from '@/utils/pdfProcessor';

export const getPdf = async (file: string): Promise<Buffer> => {
  const form = new FormData();
  form.append('files', file, 'index.html');
  form.append('files', fs.readFileSync('./resources/assets/logo.png'), 'logo.png');
  return await generatePdf(form, ProcessorType.HTML);
};

export * from './orderEmail/orderEmail.service';
export * from './orderConfirmationEmail/orderConfirmationEmail.service';
