import fs from 'fs';
import { createEnvironment, createFilesystemLoader, createFilter } from 'twing';

import { t } from '../middleware/i18n';

export const template = async (data: any, lang: string) => {
  const loader = createFilesystemLoader(fs);
  const filter = createFilter(
    'trans',
    (_executionContext, value) => {
      return Promise.resolve(t(value, lang));
    },
    [],
  );
  const environment = createEnvironment(loader);
  environment.addFilter(filter);
  const temp = await environment.loadTemplate('templates/order.twig');
  return await temp.render(data);
};
