import moduleAlias from 'module-alias';
moduleAlias.addAlias('@', __dirname + '/../../');
moduleAlias.addAlias('@templates', __dirname + '/../../../templates/');

import * as Sentry from '@sentry/node';
import _ from 'lodash';
import moment from 'moment';
import { parentPort } from 'worker_threads';

import * as commissionPriceEstimationEntityService from '@/commissionPriceEstimation/commissionPriceEstimation.service';
import prisma from '@/db/client';
import env from '@/env';
import * as enquiryFormService from '@/public/enquiryForm/enquiryForm.service';
import { Environment, getEnvironment } from '@/utils/getEnvironment';
import { timestamp } from '@/utils/timestamp';

import { ECronState } from '../types';

const setEstimationsDone = async (codes: string[], sentEmail = false) => {
  await commissionPriceEstimationEntityService.updateEstimationsCronState(codes, ECronState.DONE, sentEmail);
};

(async () => {
  if (env().CRON_NOTIFY_UNCONVERTED_CUSTOMERS_ENABLED !== true) {
    if (parentPort) parentPort.postMessage('done - not enabled');
    else process.exit(0);
    return;
  }

  try {
    const unprocessedEstimations = await prisma.commissionPriceEstimation.findMany({
      where: {
        cronState: {
          in: [ECronState.NEW],
        },
        email: {
          not: null,
        },
      },
      orderBy: {
        tsAdded: 'asc',
      },
    });
    const groupedEstimations = _.groupBy(unprocessedEstimations, 'email');

    // Each group represent a customer and all his calculations are handled together
    for (const groupKey of Object.keys(groupedEstimations)) {
      const estimations = groupedEstimations[groupKey];

      // If the estimation has a commission_id and a customer_id, it has been converted
      const isSomeEstimationConverted = estimations.some(
        ({ commission_id, customer_id }) => commission_id && customer_id,
      );
      // In that case we want to close all estimations and not send any email
      if (isSomeEstimationConverted) {
        await setEstimationsDone(estimations.map(({ code }) => code));
        continue;
      }

      // If the oldest estimation is older than 2 hours, we want to send one email for all estimations
      const { tsAdded } = estimations[0];
      const oldestEstimationDate = timestamp(Number(tsAdded));
      if (oldestEstimationDate === null) {
        Sentry.captureException(new Error(`Invalid timestamp for estimation with code: ${estimations[0].code}`));
        continue;
      }

      if (oldestEstimationDate.isSameOrBefore(moment().subtract(2, 'hours'), 'minutes')) {
        await enquiryFormService.notifyCustomerAboutUnSubmittedEnquiry({ estimations });
        await setEstimationsDone(
          estimations.map(({ code }) => code),
          true,
        );
        continue;
      }
    }
  } catch (error) {
    console.log('Error in notifyUnconvertedCustomers cron job: ', error);
    if (getEnvironment() === Environment.DEV) {
      console.error(error);
    }
    Sentry.captureException(error);
  }

  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
