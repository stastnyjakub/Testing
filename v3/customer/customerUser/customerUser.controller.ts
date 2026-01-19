import { NextFunction, Request, Response } from 'express';

import { EAuthRole } from '@/auth/types';
import { Entity, HttpException, NotFoundException } from '@/errors';
import * as languageService from '@/language/language.service';
import { validateEntityId, validatePayload } from '@/utils';
import {
  assertAuthenticatedCustomerUserRegistration,
  assertAuthenticatedUser,
} from '@/utils/validation/assertAuthenticated';

import {
  registerCustomerUserRequestBodySchema,
  sendCustomerUserInvitationRequestBodySchema,
} from './invitation/invitation.model';
import * as customerUserInvitationService from './invitation/invitation.service';
import { validateCreateCustomerUserRequestBody } from './customerUser.model';
import * as customerUserService from './customerUser.service';

export const registerCustomerUser = async ({ auth, body }: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedCustomerUserRegistration(auth);
    const { name, password, surname, phone } = validatePayload(registerCustomerUserRequestBodySchema, body);
    const customerUser = await customerUserService.registerCustomerUser({
      invitationId: auth.payload.invitationId,
      name,
      password,
      surname,
      phone,
    });

    res.status(200).json(customerUser);
  } catch (error) {
    next(error);
  }
};

export const checkCustomerUserInvitation = async ({ auth }: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedCustomerUserRegistration(auth);
    const invitation = await customerUserInvitationService.getInvitation(auth.payload.invitationId);
    if (!invitation) {
      throw new NotFoundException(Entity.CUSTOMER_USER_INVITATION);
    }
    if (invitation.used) {
      throw new HttpException(400, 'customerUserInvitation.alreadyUsed');
    }

    res.status(200).json(invitation);
  } catch (error) {
    next(error);
  }
};

export const getCustomerUser = async ({ params }: Request, res: Response, next: NextFunction) => {
  try {
    const customerUserId = validateEntityId(params.customerUserId);
    const customerUser = await customerUserService.getCustomerUser({ customerUserId });
    if (!customerUser) {
      throw new NotFoundException(Entity.CUSTOMER_USER);
    }

    res.status(200).json(customerUser);
  } catch (error) {
    next(error);
  }
};

export const sendCustomerUserInvitation = async ({ body }: Request, res: Response, next: NextFunction) => {
  try {
    const { customerUserInvitationId } = validatePayload(sendCustomerUserInvitationRequestBodySchema, body);
    await customerUserInvitationService.sendInvitation({ customerUserInvitationId });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const listCustomerUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.customerId);
    const customerUsers = await customerUserService.listCustomerUsers({ customerId });

    res.status(200).json(customerUsers);
  } catch (error) {
    next(error);
  }
};

export const createCustomerUser = async ({ lang, body, params, auth }: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(auth);
    const customerId = validateEntityId(params.customerId);
    const { email, name, surname } = validateCreateCustomerUserRequestBody(body);
    const language = await languageService.getLanguage({ languageCode: lang });
    if (!language) throw new NotFoundException(Entity.LANGUAGE);

    const createdUser = await customerUserService.onboardCustomerUser({
      customerId,
      email,
      name,
      surname,
      role: EAuthRole.Customer,
      senderId: auth.payload.userId,
      languageId: language.language_id,
    });

    res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerUserId = validateEntityId(req.params.customerUserId);
    await customerUserService.deleteCustomerUser(customerUserId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
