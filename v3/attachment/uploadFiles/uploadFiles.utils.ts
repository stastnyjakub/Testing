import { Attachment } from '@prisma/client';

import env from '@/env';

import { TAttachmentFile, TFileUploadResultsMap } from '../types';

export const buildFileUploadResultsMap = (files: TAttachmentFile[]) => {
  const fileUploadResultsMap: TFileUploadResultsMap = new Map();
  files.forEach(({ filename, originalname }) => {
    fileUploadResultsMap.set(filename, {
      name: originalname,
      status: 'error',
    });
  });
  return fileUploadResultsMap;
};

export const processFileUploadPromiseResults = (
  promiseResults: PromiseSettledResult<Attachment | undefined>[],
  fileUploadResultsMap: TFileUploadResultsMap,
) => {
  promiseResults.forEach((result) => {
    if (result === undefined || result.status === 'rejected') return;
    if (result.value === undefined) return;

    const fullFileName = result.value.fileName;
    const existingRecord = fileUploadResultsMap.get(fullFileName);
    if (!existingRecord) return;

    fileUploadResultsMap.set(fullFileName, {
      ...existingRecord,
      status: 'uploaded',
    });
  });

  return Array.from(fileUploadResultsMap.values());
};

export const generateAttachmentUploadLink = (uploadToken: string): string | null => {
  const baseUrl = env().CO_URL;
  if (!baseUrl) return null;
  const link = `${baseUrl}/attachment/upload?uploadToken=${uploadToken}`;
  return link;
};
