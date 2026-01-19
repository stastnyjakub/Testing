import { GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH } from '@/attachment/attachment.constants';
import { getAttachment } from '@/attachment/attachment.service';
import { HttpException } from '@/errors';
import * as fileService from '@/file/file.service';

import { TAttachmentFile } from '../types';

export const getAttachmentFilePath = (fileName: string) => {
  const filePath = GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH.replace(':attachmentName', fileName);
  return filePath;
};

export const getAttachmentFile = async (attachmentId: number) => {
  const attachment = await getAttachment(attachmentId);
  const filePath = getAttachmentFilePath(attachment.fileName);
  const file = await fileService.getFile(filePath);
  return {
    ...file,
    name: attachment.name,
  };
};

/**
 * @throws If save process fails, throws unknown error
 * @throws If file buffer is not provided {HttpException}
 */
export const saveAttachmentFileOrThrow = async (file: TAttachmentFile) => {
  if (!file.buffer) throw new HttpException(500, 'attachment.fileSaveFailed');
  const filePath = GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH.replace(':attachmentName', file.filename);
  try {
    await fileService.saveFile(filePath, file.buffer, file.mimetype);
  } catch (error) {
    throw new HttpException(500, 'attachment.fileSaveFailed');
  }
};

/**
 * @throws If delete process fails, throws unknown error
 */
export const deleteAttachmentFile = async (fullFileName: string) => {
  const filePath = GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH.replace(':attachmentName', fullFileName);
  await fileService.deleteFile(filePath);
  return true;
};
