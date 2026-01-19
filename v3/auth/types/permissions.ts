export type TMongoAbility = [EPermissionAction, EPermissionSubject];
export type TAbility = {
  action: EPermissionAction;
  subject: EPermissionSubject;
};

export enum EPermissionAction {
  Read = 'read',
  List = 'list',
  Write = 'write',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Upload = 'upload',
  Manage = 'manage',
}

export enum EPermissionSubject {
  Attachment = 'attachment',
  AttachmentUploadToken = 'attachmentUploadToken',
  VehicleType = 'vehicleType',
  Commission = 'commission',
  AdminMetrics = 'adminMetrics',
  Metrics = 'metrics',
  User = 'user',
  EmailAvailability = 'emailAvailability',
  Dispatcher = 'dispatcher',
  Enquiry = 'enquiry',
  Offer = 'offer',
  EnquiryForm = 'enquiryForm',
  Geocoding = 'geocoding',
  CommissionPriceEstimation = 'commissionPriceEstimation',
  ApiKey = 'apiKey',
  Job = 'job',
}

export enum EAuthRole {
  System = 'system',
  Admin = 'admin',
  QaplineEmployee = 'qaplineEmployee',
  DispatcherOwner = 'dispatcherOwner',
  Dispatcher = 'dispatcher',
  CustomerOwner = 'customerOwner',
  Customer = 'customer',
  AttachmentsUploader = 'attachmentsUploader',
  OnboardingUser = 'onboardingUser',
  CustomerRegistration = 'customerRegistration',
  CustomerUserRegistration = 'customerUserRegistration',
  ApiKeyEnquiryForm = 'apiKeyEnquiryForm',
  ApiKeyAdmin = 'apiKeyAdmin',
  ApiKeyJobCaller = 'apiKeyJobCaller',
}
