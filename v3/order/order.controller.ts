import { NextFunction, Request, Response } from 'express';

import * as attachmentService from '@/attachment/attachment.service';
import { generateAttachmentUploadLink } from '@/attachment/uploadFiles/uploadFiles.utils';
import { HttpException } from '@/errors';
import { t } from '@/middleware/i18n';
import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';

import { saveFile } from '../file/file.service';

import {
  validateCreateBody,
  validateSendConfirmationMailRequestBody,
  validateSendMailRequestBody,
} from './order.model';
import { getPdf } from './order.service';
import * as orderService from './order.service';
import { template } from './order.template';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Order']
    #swagger.description = 'Create order document'
    #swagger.operationId = 'createOrder'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/V3OrderPdfBody' },
    }
  */
  const { error } = validateCreateBody(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const filename = `order/${req.body.qid}.pdf`;

    const uploadToken = await attachmentService.createOrGetAttachmentUploadToken({
      commissionId: req.body.commissionId,
    });
    const uploadLink = generateAttachmentUploadLink(uploadToken.token);

    const doc = await template({ ...req.body, uploadLink }, req.body.lang);

    const pdf = await getPdf(doc);

    await saveFile(filename, pdf, 'application/pdf');
    return res.send();
  } catch (e) {
    next(e);
  }
};

export const previewPdf = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Order']
    #swagger.description = 'Preview order document pdf'
    #swagger.operationId = 'previewOrderPDF'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/V3OrderPdfBody' },
    }
    #swagger.responses[200] = {
      content: {'application/pdf': {}}
    }
  */
  const { error } = validateCreateBody(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const uploadToken = await attachmentService.createOrGetAttachmentUploadToken({
      commissionId: req.body.commissionId,
    });
    const uploadLink = generateAttachmentUploadLink(uploadToken.token);
    const doc = await template({ ...req.body, uploadLink }, req.body.lang);
    const pdf = await getPdf(doc);
    res.contentType('application/pdf');
    return res.send(pdf);
  } catch (e) {
    next(e);
  }
};

export const sendMail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(req.auth);

    const { commissionId, emails, lang, message, subject } = validateSendMailRequestBody(req.body);
    const { rejectedEmails, successfulEmails } = await orderService.sendOrderMail({
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
      if (isAllRejected) throw new HttpException(500, 'orderEmail.mailSendingFailed');
      if (isSomeRejected) return 207;
      return 200;
    })();

    res.status(statusCode).json({
      message: isSomeRejected
        ? t('orderEmail.mailSendingPartiallyFailed', lang, { emails: rejectedEmails.join(', ') })
        : t('orderEmail.mailSendingSucceeded', lang),
      successfulEmails,
      rejectedEmails: isSomeRejected ? rejectedEmails : undefined,
    });
  } catch (e: any) {
    next(e);
  }
};

export const sendConfirmationMail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(req.auth);

    const { emails, lang, message, subject } = validateSendConfirmationMailRequestBody(req.body);
    const { rejectedEmails, successfulEmails } = await orderService.sendOrderConfirmationMail({
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
      if (isAllRejected) throw new HttpException(500, 'orderConfirmationEmail.mailSendingFailed');
      if (isSomeRejected) return 207;
      return 200;
    })();

    res.status(statusCode).json({
      message: isSomeRejected
        ? t('orderConfirmationEmail.mailSendingPartiallyFailed', lang, { emails: rejectedEmails.join(', ') })
        : t('orderConfirmationEmail.mailSendingSucceeded', lang),
      successfulEmails,
      rejectedEmails: isSomeRejected ? rejectedEmails : undefined,
    });
  } catch (error) {
    next(error);
  }
};
