import { NextFunction, Request, Response } from 'express';

import {
  validateAttachmentCreateRequestBody,
  validateAttachmentGetRequestQuery,
  validateAttachmentListRequestQuery,
  validateAttachmentMailFileRequestBody,
  validateAttachmentUpdateRequestBody,
  validateAttachmentUploadRequestFiles,
  validateCompressionJobRequestBody,
  validateGenerateAttachmentUploadLinkRequestParams,
  validateGenerateAttachmentUploadLinkRequestQuery,
  validateGetFileRequestQuery,
} from '@/attachment/attachment.model';
import * as attachmentService from '@/attachment/attachment.service';
import { buildAttachmentIncludeArgs } from '@/attachment/attachment.utils';
import {
  TAttachmentGetRequestQuery,
  TAttachmentListRequestQuery,
  TAttachmentUploadRequestFiles,
  TGetAttachmentIncludeArgs,
  TListAttachmentIncludeArgs,
} from '@/attachment/types';
import { EAuthRole } from '@/auth/types';
import { HttpException, UnauthenticatedException, UnauthorizedException } from '@/errors';
import * as invoiceService from '@/invoice/invoice.service';
import { t } from '@/middleware/i18n';
import { validateEntityId } from '@/utils';
import { getAttachmentFileFromMulterFile } from '@/utils';

import { generateAttachmentUploadLink } from './uploadFiles/uploadFiles.utils';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Get all attachments for a commission'
    #swagger.operationId = 'listAttachments'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['commissionId'] = {
      in: 'query',
      description: 'Commission ID',
      required: false,
    }
    #swagger.parameters['invoiceId'] = {
      in: 'query',
      description: 'Invoice ID',
      required: false,
    }
    #swagger.parameters['withCommissionsDeliveryNotes'] = {
      in: 'query',
      required: false,
    }
    #swagger.parameters['include'] = {
      in: 'query',
      description: 'Include additional data',
      type: 'string',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/AttachmentListResponseBody' },
    }
  */
  try {
    // If the role is ATTACHMENT_UPLOAD, prohibit private values like commission details etc...
    if (req.auth.payload == undefined) throw new UnauthenticatedException();

    const {
      include,
      invoiceId: invoiceIdQuery,
      withCommissionsDeliveryNotes,
      commissionId: commissionIdQuery,
    } = validateAttachmentListRequestQuery(req.query, {
      prohibitPrivateValues: req.auth.payload.role === EAuthRole.AttachmentsUploader,
    });

    const commissionId = commissionIdQuery ? validateEntityId(commissionIdQuery) : undefined;
    const invoiceId = invoiceIdQuery ? validateEntityId(invoiceIdQuery) : undefined;

    const includeArgs = buildAttachmentIncludeArgs<
      NonNullable<TAttachmentListRequestQuery['include']>,
      TListAttachmentIncludeArgs
    >(include || []);

    const attachments = await attachmentService.listAttachments({
      commissionId,
      invoiceId,
      includeArgs,
      withCommissionsDeliveryNotes,
    });

    res.status(200).send(attachments);
  } catch (error) {
    next(error);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Get attachment by ID'
    #swagger.operationId = 'getAttachment'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['attachmentId'] = {
      in: 'path',
      description: 'Attachment ID',
      required: true,
    }
    #swagger.parameters['include'] = {
      in: 'query',
      description: 'Include additional data',
      type: 'string',
      enum: ['commission', 'uploadedBy', 'invoice', "invoiceEmailData"],
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/AttachmentGetResponseBody' },
    }
  */
  try {
    const attachmentId = validateEntityId(req.params.attachmentId);
    const { include } = validateAttachmentGetRequestQuery(req.query);

    const includeArgs = buildAttachmentIncludeArgs<
      NonNullable<TAttachmentGetRequestQuery['include']>,
      TGetAttachmentIncludeArgs
    >(include || []);

    const attachment = await attachmentService.getAttachment(attachmentId, includeArgs);

    res.status(200).send(attachment);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Create attachment'
    #swagger.operationId = 'createAttachment'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      content: 'multipart/form-data',
      schema: {
        $ref: '#/definitions/AttachmentCreateRequestBody'
      }
    }
    #swagger.responses[201] = {
      schema: { $ref: '#/definitions/AttachmentGetResponseBody' },
    }
  */
  try {
    if (req.auth.payload == undefined) throw new UnauthenticatedException();
    const { name, type, commissionId, invoiceId } = validateAttachmentCreateRequestBody(req.body);

    if (!req.file) {
      throw new HttpException(400, 'attachment.fileIsRequired');
    }

    const userId = req.auth.payload.userId;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const attachment = await attachmentService.createAttachment({
      name,
      type,
      userId,
      file: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      },
      commissionId: commissionId ? Number(commissionId) : undefined,
      invoiceId: invoiceId ? Number(invoiceId) : undefined,
    });

    res.status(201).send(attachment);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Update attachment'
    #swagger.operationId = 'updateAttachment'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['attachmentId'] = {
      in: 'path',
      description: 'Attachment ID',
      required: true,
    }
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: '#/definitions/AttachmentUpdateRequestBody'
      }
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/AttachmentGetResponseBody' },
    }
  */
  try {
    const body = validateAttachmentUpdateRequestBody(req.body);
    const attachmentId = validateEntityId(req.params.attachmentId);

    const attachment = await attachmentService.updateAttachment({
      ...body,
      attachmentId,
    });

    res.status(200).send(attachment);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Delete attachment'
    #swagger.operationId = 'removeAttachment'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['attachmentId'] = {
      in: 'path',
      description: 'Attachment ID',
      required: true,
    }
    #swagger.responses[204] = {}
  */
  try {
    const attachmentId = validateEntityId(req.params.attachmentId);

    await attachmentService.removeAttachment(attachmentId);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Get attachment file'
    #swagger.operationId = 'getFile'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['attachmentId'] = {
      in: 'path',
      description: 'Attachment ID',
      required: true,
    }
  */
  try {
    const attachmentId = validateEntityId(req.params.attachmentId);
    const { download } = validateGetFileRequestQuery(req.query);

    const { contentType, name, content } = await attachmentService.getAttachmentFile(attachmentId);

    // Download will mark the invoice attachment as sent
    if (download) {
      const { invoice_id } = await attachmentService.getAttachment(attachmentId);
      invoice_id && (await invoiceService.updateInvoiceSentStatus({ invoiceId: invoice_id, sent: true }));
    }

    contentType && res.contentType(contentType);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(name)}`);
    res.setHeader('Content-Length', content.length);
    res.status(200).send(content);
  } catch (error) {
    next(error);
  }
};

export const mailFile = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Mail attachment file'
    #swagger.operationId = 'mailFile'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['attachmentId'] = {
      in: 'path',
      description: 'Attachment ID',
      required: true,
    }
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: '#/definitions/AttachmentMailFileRequestBody'
      }
    }
    #swagger.responses[204] = {}
  */
  try {
    if (req.auth.payload == undefined) throw new UnauthenticatedException();
    const { emails, message, lang } = validateAttachmentMailFileRequestBody(req.body);
    const attachmentId = validateEntityId(req.params.attachmentId);

    const { successfulEmails, rejectedEmails } = await attachmentService.mailAttachment({
      lang,
      emails,
      message,
      attachmentId,
      senderId: req.auth.payload.userId,
    });

    const isAllRejected = successfulEmails.length === 0;
    const isSomeRejected = rejectedEmails.length > 0 && rejectedEmails.length < emails.length;

    // If only some emails were rejected, return 207 (Multi-Status response)
    const statusCode = (() => {
      if (isAllRejected) throw new HttpException(500, 'invoice.mailSendingFailed');
      if (isSomeRejected) return 207;
      return 200;
    })();

    res.status(statusCode).json({
      message: isSomeRejected
        ? t('attachmentEmail.mailSendingPartiallyFailed', lang, { emails: rejectedEmails.join(', ') })
        : t('attachmentEmail.mailSendingSucceeded', lang),
      successfulEmails,
      rejectedEmails: isSomeRejected ? rejectedEmails : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAttachments = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Upload attachments'
    #swagger.operationId = 'uploadAttachments'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: '#/definitions/AttachmentUploadRequestBody'
      }
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/AttachmentUploadResponse' },
    }
    #swagger.responses[207] = {
      schema: { $ref: '#/definitions/AttachmentUploadResponse' },
    }
  */
  try {
    validateAttachmentUploadRequestFiles(req.files || {});
    const reqFiles = req.files as TAttachmentUploadRequestFiles;
    if (!reqFiles?.invoice && !reqFiles?.deliveryNotes) {
      throw new HttpException(400, 'attachment.fileIsRequired');
    }

    if (!req.auth.payload || req.auth.payload.role !== EAuthRole.AttachmentsUploader) {
      throw new UnauthorizedException();
    }

    const invoiceAttachmentFile = reqFiles?.invoice?.[0];
    const deliveryNotesAttachmentFiles = reqFiles?.deliveryNotes;

    const results = await attachmentService.uploadFilesToCommission(
      req.auth.payload.commissionId,
      invoiceAttachmentFile ? getAttachmentFileFromMulterFile(invoiceAttachmentFile) : undefined,
      deliveryNotesAttachmentFiles?.map(getAttachmentFileFromMulterFile),
    );
    const allSuccess = results.every((result) => result.status === 'uploaded');
    res.status(allSuccess ? 200 : 207).send(results);
  } catch (error) {
    next(error);
  }
};

export const checkUploadToken = async (_: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Attachment']
    #swagger.description = 'Check if upload token is valid'
    #swagger.operationId = 'checkUploadToken'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {}
  */
  try {
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const getAttachmentUploadLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commissionId } = validateGenerateAttachmentUploadLinkRequestParams(req.params);
    const { renew } = validateGenerateAttachmentUploadLinkRequestQuery(req.query);

    const uploadTokenEntity = await attachmentService.createOrGetAttachmentUploadToken({ commissionId, renew });
    const uploadLink = generateAttachmentUploadLink(uploadTokenEntity.token);

    res.status(200).send({ attachmentUploadLink: uploadLink });
  } catch (error) {
    next(error);
  }
};

export const compressionJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attachmentId } = validateCompressionJobRequestBody(req.body);
    await attachmentService.runCompressionJob({ attachmentId });
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
