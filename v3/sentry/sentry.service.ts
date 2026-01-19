import * as Sentry from '@sentry/node';
import axios from 'axios';
import express from 'express';

import env from '@/env';
import { loggerService } from '@/logging/logging.service';
import { getEnvironment } from '@/utils';

import { HttpException } from '../errors';

const SENTRY_HOST = 'sentry.k42.dev';
const SENTRY_PROJECT_IDS = ['28'];

export const tunnelAction = async (envelope: Buffer) => {
  const envelopeString = envelope.toString('utf-8');

  const piece = envelopeString.split('\n')[0];
  const header = JSON.parse(piece);
  const dsn = new URL(header['dsn']);
  const project_id = dsn.pathname?.replace('/', '');

  if (dsn.hostname !== SENTRY_HOST) {
    throw new HttpException(400, 'sentry.invalidHostname');
  }

  if (!project_id || !SENTRY_PROJECT_IDS.includes(project_id)) {
    throw new HttpException(400, 'sentry.invalidProjectId');
  }

  const upstream_sentry_url = `https://${SENTRY_HOST}/api/${project_id}/envelope/`;

  const { data } = await axios.post(upstream_sentry_url, envelope, {
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
  });
  return data;
};

const checkEventDrop = (event: Sentry.ErrorEvent): PromiseLike<Sentry.ErrorEvent | null> | Sentry.ErrorEvent | null => {
  if (event.request?.headers?.origin && event.request.headers.origin.includes('localhost')) {
    return null;
  }
  return event;
};

export const initSentry = () => {
  if (env().SENTRY_ENABLED === false) {
    loggerService.info('Sentry is disabled');
    return;
  }
  loggerService.info('Sentry is enabled');
  Sentry.init({
    dsn: 'https://df7e36045ab6e7a804952be547abcea1@sentry.k42.dev/27',
    integrations: [Sentry.httpIntegration(), Sentry.expressIntegration(), Sentry.prismaIntegration()],
    environment: getEnvironment(),
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    beforeSend: checkEventDrop,
  });
};

export const setupErrorHandler = (app: express.Express) => {
  if (env().SENTRY_ENABLED === false) return;
  loggerService.info('Setting up Sentry error handler');
  Sentry.setupExpressErrorHandler(app);
};
