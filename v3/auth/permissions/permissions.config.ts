import { EAuthRole as Role, EPermissionAction as Action, EPermissionSubject as Subject } from '../types/permissions';

type RolePermissions = Partial<Record<Subject, Partial<Record<Action, boolean>>>>;

const adminPermissions: RolePermissions = {
  [Subject.AdminMetrics]: {
    [Action.Manage]: true,
  },
  [Subject.ApiKey]: {
    [Action.Manage]: true,
  },
};
const dispatcherPermissions: RolePermissions = {
  [Subject.Dispatcher]: {
    [Action.Update]: true,
    [Action.Read]: true,
  },
  [Subject.Enquiry]: {
    [Action.Read]: true,
    [Action.List]: true,
  },
  [Subject.Offer]: {
    [Action.Create]: true,
    [Action.Delete]: true,
  },
  [Subject.VehicleType]: {
    [Action.List]: true,
  },
  [Subject.EmailAvailability]: {
    [Action.Read]: true,
  },
};
const attachmentsUploaderPermissions: RolePermissions = {
  [Subject.Attachment]: {
    [Action.Upload]: true,
    [Action.List]: true,
  },
  [Subject.AttachmentUploadToken]: {
    [Action.Read]: true,
  },
};
const onboardingUserPermissions: RolePermissions = {
  [Subject.Dispatcher]: {
    [Action.Create]: true,
    [Action.Update]: true,
    [Action.Read]: true,
  },
  [Subject.VehicleType]: {
    [Action.List]: true,
  },
  [Subject.EmailAvailability]: {
    [Action.Read]: true,
  },
};
const apiKeyEnquiryFormPermissions: RolePermissions = {
  [Subject.EnquiryForm]: {
    [Action.Read]: true,
    [Action.Write]: true,
  },
  [Subject.Geocoding]: {
    [Action.Read]: true,
  },
  [Subject.CommissionPriceEstimation]: {
    [Action.Read]: true,
  },
};
const apiKeyJobCallerPermissions: RolePermissions = {
  [Subject.Job]: {
    [Action.Manage]: true,
  },
};

const permissions: Record<Role, RolePermissions> = {
  [Role.Admin]: {
    ...adminPermissions,
    ...dispatcherPermissions,
  },
  [Role.QaplineEmployee]: {},
  [Role.System]: { ...adminPermissions },
  [Role.DispatcherOwner]: {
    ...dispatcherPermissions,
  },
  [Role.Dispatcher]: {
    ...dispatcherPermissions,
  },
  [Role.AttachmentsUploader]: {
    ...attachmentsUploaderPermissions,
  },
  [Role.OnboardingUser]: {
    ...onboardingUserPermissions,
  },
  [Role.ApiKeyEnquiryForm]: { ...apiKeyEnquiryFormPermissions },
  [Role.ApiKeyJobCaller]: { ...apiKeyJobCallerPermissions },
  [Role.ApiKeyAdmin]: {},
  [Role.CustomerOwner]: {},
  [Role.Customer]: {},
  [Role.CustomerRegistration]: {},
  [Role.CustomerUserRegistration]: {},
};

export default permissions;
