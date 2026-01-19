import { NextFunction, Request, Response } from 'express';

import { HttpException } from '@/errors';
import { t } from '@/middleware/i18n';
import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';

import { saveFile } from '../file/file.service';

import { validateNeutralizationBody, validateSendDischargeMailRequestBody } from './discharge.model';
import * as dischargeService from './discharge.service';
import { neutralizationTemplate } from './discharge.template';

export const previewNeutralizedPdf = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Discharge']
    #swagger.description = 'Preview neutralized discharge pdf'
    #swagger.operationId = 'previewDischarge'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      schema: { $ref: '#/definitions/V3DischargePdfBody' },
    }
    #swagger.responses[200] = {
      content: {'application/pdf': {}}
    }
  */
  const { error } = validateNeutralizationBody(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const doc = await neutralizationTemplate(req.body, req.body.lang);
    const pdf = await dischargeService.getPdf(doc);
    const filename = `discharge/${req.body.qid}-${req.body.dischargeNumber}.pdf`;
    await saveFile(filename, pdf, 'application/pdf');
    res.contentType('application/pdf');
    return res.send(pdf);
  } catch (e) {
    next(e);
  }
};

export const sendDischargeMail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(req.auth);

    const { commissionId, locationId, emails, lang, message, subject } = validateSendDischargeMailRequestBody(req.body);
    const { rejectedEmails, successfulEmails } = await dischargeService.sendDischargeMail({
      commissionId,
      locationId,
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
      if (isAllRejected) throw new HttpException(500, 'dischargeEmail.mailSendingFailed');
      if (isSomeRejected) return 207;
      return 200;
    })();

    res.status(statusCode).json({
      message: isSomeRejected
        ? t('dischargeEmail.mailSendingPartiallyFailed', lang, { emails: rejectedEmails.join(', ') })
        : t('dischargeEmail.mailSendingSucceeded', lang),
      successfulEmails,
      rejectedEmails: isSomeRejected ? rejectedEmails : undefined,
    });
  } catch (e: any) {
    next(e);
  }
};
