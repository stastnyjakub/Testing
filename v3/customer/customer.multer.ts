import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import multer from 'multer';

import { BUCKET_NAME } from '@/config/constants';
import env from '@/env';
import { HttpException } from '@/errors';
import MulterGoogleCloudStorage from '@/libs/multerGoogleCloudStorage';
import { EFileSizeUnit, EMimeType } from '@/types';
import { getFileSizeInBytes } from '@/utils';

import { GOOGLE_CLOUD_STORAGE_BUCKET_PROFILE_PICTURES_PATH } from './customer.constants';

export const initializeUploadMiddleware = async () => {
  const projectId = env().GCLOUD_PROJECT_ID;

  const profilePictureUploadMiddlewareInstance = multer({
    storage: new MulterGoogleCloudStorage({
      projectId,
      bucket: BUCKET_NAME,
      destination: GOOGLE_CLOUD_STORAGE_BUCKET_PROFILE_PICTURES_PATH.replace(':fileName', ''),
      uniformBucketLevelAccess: true,
      filename: (_, file: Express.Multer.File, cb) => {
        cb(null, `${randomUUID()}.${file.originalname.split('.').pop()}`);
      },
    }),
    limits: {
      fileSize: getFileSizeInBytes(500, EFileSizeUnit.KB),
    },
    fileFilter: (_, file, cb) => {
      const allowedMimeTypes = [EMimeType.PNG, EMimeType.JPEG, EMimeType.JPG];
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

  const profilePictureCreateMiddleware = wrapMulterMiddleware(
    profilePictureUploadMiddlewareInstance.single('profilePicture'),
  );

  return { profilePictureCreateMiddleware };
};
