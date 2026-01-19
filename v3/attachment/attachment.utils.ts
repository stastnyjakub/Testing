import { GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH } from './attachment.constants';

export const buildAttachmentIncludeArgs = <
  QueryInclude extends Array<keyof AttachmentIncludeArgs>,
  AttachmentIncludeArgs extends Record<string, boolean>,
>(
  queryInclude: QueryInclude,
): AttachmentIncludeArgs | undefined => {
  if (!queryInclude) return undefined;

  const includeArgs = queryInclude.reduce(
    (acc, include) => {
      acc[include] = true;
      return acc;
    },
    {} as Record<keyof AttachmentIncludeArgs, boolean>,
  );

  return includeArgs as AttachmentIncludeArgs;
};

export const getAttachmentBucketUrl = (fileName: string) => {
  return GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH.replace(':attachmentName', fileName);
};
