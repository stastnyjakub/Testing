import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';

import { HttpException } from '@/errors';
import { t } from '@/middleware/i18n';

import {
  validateOauth2AuthorizationCallbackRequestQuery,
  validateOauth2RegistrationCallbackRequestQuery,
} from './kb.model';
import * as kbService from './kb.service';

export const clientRegistrationCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await kbService.saveClientRegistrationData({
      query: req.query,
      body: req.body,
    });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const oauth2RegistrationCallback = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['KB']
    #swagger.description = 'Oauth2 registration callback'
    #swagger.operationId = 'oauth2RegistrationCallback'
    #swagger.parameters["salt"] = {
      in: 'query',
      description: 'Salt',
      type: 'string',
      required: true,
    }
    #swagger.parameters["encryptedData"] = {
      in: 'query',
      description: 'Encrypted data',
      type: 'string',
      required: true,
    }
    #swagger.responses[200] = {
      description: 'OK',
    }
  */
  try {
    const { encryptedData, salt } = validateOauth2RegistrationCallbackRequestQuery(req.query);
    await kbService.saveOauth0RegistrationData({ encryptedData, salt }).catch((error) => {
      Sentry.captureException(error);
      throw new HttpException(500, 'kb.oauth2Registration.error');
    });
    res.status(200).send(t('kb.oauth2Registration.success'));
  } catch (error) {
    next(error);
  }
};

export const oauth2AuthorizationCallback = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['KB']
    #swagger.description = 'Oauth2 authorization callback'
    #swagger.operationId = 'oauth2AuthorizationCallback'
    #swagger.parameters["code"] = {
      in: 'query',
      description: 'Code',
      type: 'string',
      required: true,
    }
    #swagger.parameters["client_id"] = {
      in: 'query',
      description: 'Client id',
      type: 'string',
      required: false,
    }
    #swagger.responses[200] = {
      description: 'OK',
    }
  */
  try {
    const { code, client_id } = validateOauth2AuthorizationCallbackRequestQuery(req.query);
    try {
      await kbService.processOAuth2Authorization({ code, client_id });
    } catch (error) {
      Sentry.captureException(error);
      throw new HttpException(500, 'kb.oauth2Authorization.error');
    }
    res.status(200).send(t('kb.oauth2Authorization.success'));
  } catch (error) {
    next(error);
  }
};
