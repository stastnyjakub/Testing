import { isArray } from 'lodash';
import moment from 'moment-timezone';

import { CommissionExtended } from './commissionList.types';

export const convertTimestampsToDates = (commissions: CommissionExtended[]) => {
  moment.tz.setDefault('Europe/Prague');
  return commissions.map(({ discharge_date, loading_date, ...foundCommission }) => {
    return {
      ...foundCommission,
      discharge_date: isArray(discharge_date)
        ? discharge_date
            .map((item) => {
              const raw = Number(String(item)) / 1000;
              const date = moment.unix(raw);
              return date.isValid() ? date.format('DD.MM.YYYY') : null;
            })
            .filter(Boolean)
            .join(', ')
        : null,
      loading_date: isArray(loading_date)
        ? loading_date
            .map((item) => {
              const raw = Number(String(item)) / 1000;
              const date = moment.unix(raw);
              return date.isValid() ? date.format('DD.MM.YYYY') : null;
            })
            .filter(Boolean)
            .join(', ')
        : null,
    };
  });
};
