export type HttpExceptionReason = { key: string; values: Record<string, unknown> } | string;

export enum Entity {
  GLOBAL = 'global',
  AUTO = '[auto]',
  ENQUIRY = 'enquiry',
  COMMISSION_PRICE_ESTIMATION = 'commissionPriceEstimation',
  CUSTOMER = 'customer',
  CARRIER = 'carrier',
  USER = 'user',
  CUSTOMER_USER = 'customerUser',
  OFFER = 'offer',
  DISPATCHER = 'dispatcher',
  VEHICLE = 'vehicle',
  ORDER = 'order',
  COMMISSION = 'commission',
  COMMISSION_DISCHARGE = 'commissionDischarge',
  ATTACHMENT = 'attachment',
  INVOICE = 'invoice',
  LOCATION = 'location',
  LANGUAGE = 'language',
  RAMP = 'ramp',
  CUSTOMER_CONTACT = 'customerContact',
  CUSTOMER_PROFILE_PICTURE = 'customerProfilePicture',
  CUSTOMER_REGISTRATION = 'customerRegistration',
  CUSTOMER_USER_INVITATION = 'customerUserInvitation',
}

export class HttpException extends Error {
  public name: string;
  public reason: HttpExceptionReason;
  public status: number;
  public cause?: unknown;

  constructor(status: number, reason: HttpExceptionReason, cause?: unknown) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.reason = reason;
    this.status = status;
    this.cause = cause;
  }
}

export class NotFoundException extends HttpException {
  constructor(entity: Entity = Entity.AUTO) {
    super(404, `${entity}.notFound`);
  }
}

export class InvalidBodyException extends HttpException {
  constructor(details?: unknown) {
    super(400, 'invalidBody', details);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(403, message || 'unauthorized');
  }
}

export class UnauthenticatedException extends HttpException {
  constructor() {
    super(401, 'unauthenticated');
  }
}

export class InvalidIdException extends HttpException {
  constructor() {
    super(400, 'invalidId');
  }
}
