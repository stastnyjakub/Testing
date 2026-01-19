import { NextFunction, Request, Response } from 'express';

import { HttpException } from '@/errors';
import { Environment, getEnvironment, isDebugMode } from '@/utils';

import { Namespace, t } from './i18n';

export const errorHandler = async (error: Error | HttpException, req: Request, res: Response, _: NextFunction) => {
  if (getEnvironment() === Environment.DEV || isDebugMode()) console.log(error);
  error.message = t('serverError', req.lang, undefined, Namespace.VALIDATION);

  if (!(error instanceof HttpException)) {
    return res.status(500).json({
      message: error.message,
      details: error.cause,
      stack: getEnvironment() === Environment.DEV || isDebugMode() ? error.stack : undefined,
    });
  }

  if (typeof error.reason === 'string') {
    const key = error.reason.replace('[auto]', req.entityName);
    error.message = t(key, req.lang, undefined, Namespace.VALIDATION);
  } else {
    const key = error.reason.key.replace('[auto]', req.entityName);
    error.message = t(key, req.lang, error.reason.values, Namespace.VALIDATION);
  }

  return res.status(error.status).json({
    message: error.message,
    details: error.cause,
    stack: getEnvironment() === Environment.DEV || isDebugMode() ? error.stack : undefined,
  });
};
