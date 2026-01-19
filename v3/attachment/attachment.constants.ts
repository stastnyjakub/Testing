export const ATTACHMENT_GET_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES = [
  'commission',
  'uploadedBy',
  'invoice',
  'invoiceEmailData',
] as const;
export const ATTACHMENT_LIST_REQUEST_QUERY_ALLOWED_INCLUDE_VALUES = ['commission', 'uploadedBy', 'invoice'] as const;

export const GOOGLE_CLOUD_STORAGE_BUCKET_ATTACHMENTS_PATH = 'attachments/:attachmentName' as const;
