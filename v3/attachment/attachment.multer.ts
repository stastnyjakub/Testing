import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import multer from 'multer';

import { BUCKET_NAME } from '@/config/constants';
import env from '@/env';
import { HttpException } from '@/errors';
import MulterGoogleCloudStorage from '@/libs/multerGoogleCloudStorage';
import { EFileSizeUnit, EMimeType } from '@/types';
import { getFileSizeInBytes } from '@/utils';

import { GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH } from './attachment.constants';

export const initializeUploadMiddleware = async () => {
  const projectId = env().GCLOUD_PROJECT_ID;

  const attachmentUploadMiddlewareInstance = multer({
    storage: new MulterGoogleCloudStorage({
      projectId,
      bucket: BUCKET_NAME,
      destination: GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH.replace(':attachmentName', ''),
      uniformBucketLevelAccess: true,
      filename: (_, file: Express.Multer.File, cb) => {
        cb(null, `${randomUUID()}.${file.originalname.split('.').pop()}`);
      },
      pdfCompression: 'ebook',
    }),
    limits: {
      fileSize: getFileSizeInBytes(20, EFileSizeUnit.MB),
    },
    fileFilter: (_, file, cb) => {
      const allowedMimeTypes = [EMimeType.PDF, EMimeType.PNG, EMimeType.JPEG, EMimeType.JPG];
      if (!allowedMimeTypes.includes(file.mimetype as EMimeType)) {
        return cb(new HttpException(400, 'invalidMimeType', file.mimetype));
      }
      cb(null, true);
    },
  });

  function wrapMulterMiddleware(middleware: RequestHandler): RequestHandler {
    return (req, res, next) => {
      middleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          next(new HttpException(400, `multer.${err.code}`, `${err.message}, ${err.field}`));
        } else if (err) {
          next(err);
        } else {
          next();
        }
      });
    };
  }

  const attachmentCreateMiddleware = wrapMulterMiddleware(attachmentUploadMiddlewareInstance.single('attachment'));

  const attachmentUploadMiddleware = wrapMulterMiddleware(
    attachmentUploadMiddlewareInstance.fields([{ name: 'invoice', maxCount: 1 }, { name: 'deliveryNotes' }]),
  );

  return { attachmentCreateMiddleware, attachmentUploadMiddleware };
};
