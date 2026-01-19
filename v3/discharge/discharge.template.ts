import fs from 'fs';
import moment from 'moment-timezone';
import { createEnvironment, createFilesystemLoader, createFilter } from 'twing';

import { t } from '../middleware/i18n';

export const neutralizationTemplate = async (data: any, lang: string) => {
  const loader = createFilesystemLoader(fs);
  const environment = createEnvironment(loader);
  const filter = createFilter(
    'trans',
    (_executionContext, value) => {
      return Promise.resolve(t(value, lang));
    },
    [],
  );
  const dateFilter = createFilter(
    'format_date',
    (_executionContext, value) => {
      return Promise.resolve(
        moment
          .unix(Math.floor(Number(value) / 1000))
          .tz('Europe/Prague')
          .format('DD.MM.YYYY'),
      );
    },
    [],
  );
  environment.addFilter(filter);
  environment.addFilter(dateFilter);
  const temp = await environment.loadTemplate('templates/discharge.twig');
  return await temp.render(data);
};
