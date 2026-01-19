import { NextFunction, Request, Response } from 'express';

import { HttpException } from '@/errors';
import { t } from '@/middleware/i18n';
import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';

import { saveFile } from '../file/file.service';

import { validateCreateBody, validateSendMailRequestBody } from './loading.model';
import * as loadingService from './loading.service';
import { template } from './loading.template';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Loading']
    #swagger.description = 'Create loading document'
    #swagger.operationId = 'createLoading'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/V3LoadingPdfBody' },
    }
  */
  const { error } = validateCreateBody(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const filename = `loading/${req.body.qid}.pdf`;

    const doc = template(req.body, req.body.lang);

    const pdf = await loadingService.getPdf(doc);

    await saveFile(filename, pdf, 'application/pdf');
    return res.send();
  } catch (e) {
    next(e);
  }
};

export const previewPdf = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Loading']
    #swagger.description = 'Preview loading document'
    #swagger.operationId = 'previewLoading'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/V3LoadingPdfBody' },
    }
    #swagger.responses[200] = {
      content: {'application/pdf': {}}
    }
  */
  const { error } = validateCreateBody(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const doc = template(req.body, req.body.lang);
    const pdf = await loadingService.getPdf(doc);
    res.contentType('application/pdf');
    return res.send(pdf);
  } catch (e) {
    next(e);
  }
};

export const sendLoadingMail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(req.auth);

    const { commissionId, emails, lang, message, subject } = validateSendMailRequestBody(req.body);
    const { rejectedEmails, successfulEmails } = await loadingService.sendLoadingMail({
      commissionId,
      emails,
      lang,
      message,
      subject,
      senderId: req.auth.payload.userId,
    });

    const isAllRejected = successfulEmails.length === 0;
    const isSomeRejected = rejectedEmails.length > 0 && rejectedEmails.length < emails.length;

    // If only some emails were rejected, return 207 (Multi-Status response)
    const statusCode = (() => {
      if (isAllRejected) throw new HttpException(500, 'loadingEmail.mailSendingFailed');
      if (isSomeRejected) return 207;
      return 200;
    })();

    res.status(statusCode).json({
      message: isSomeRejected
        ? t('loadingEmail.mailSendingPartiallyFailed', lang, { emails: rejectedEmails.join(', ') })
        : t('loadingEmail.mailSendingSucceeded', lang),
      successfulEmails,
      rejectedEmails: isSomeRejected ? rejectedEmails : undefined,
    });
  } catch (e: any) {
    next(e);
  }
};
