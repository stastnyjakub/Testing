import { NextFunction, Request, Response } from 'express';

import { Entity, NotFoundException } from '@/errors';
import { validatePayload } from '@/utils';
import { assertAuthenticatedCustomerRegistration } from '@/utils/validation/assertAuthenticated';

import {
  sendRegistrationRequestBodySchema,
  validateProcessCustomerRegistrationRequestRequestBody,
  validateRegisterCustomerRequestBody,
} from './customerRegistration.model';
import * as customerRegistrationService from './customerRegistration.service';

export const sendRegistration = async ({ body }: Request, res: Response, next: NextFunction) => {
  try {
    const { customerRegistrationId } = validatePayload(sendRegistrationRequestBodySchema, body);
    await customerRegistrationService.sendRegistrationEmail({ customerRegistrationId });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

//TODO: Implement inviteExistingUser after fixing old IS
export const inviteExistingUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedCustomerRegistration(req.auth);
    // const { customerRegistrationId } = req.auth.payload;
    // const { email } = req.body;

    // res.sendStatus(204);
    res.sendStatus(501);
  } catch (error) {
    next(error);
  }
};

export const processCustomerRegistrationRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyIdentification, email, password } = validateProcessCustomerRegistrationRequestRequestBody(req.body);

    await customerRegistrationService.processRegistrationRequest({
      companyIdentification,
      email,
      password,
      lang: req.lang,
    });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedCustomerRegistration(req.auth);
    const { customerRegistrationId } = req.auth.payload;
    const { company, user } = validateRegisterCustomerRequestBody(req.body);

    const customer = await customerRegistrationService.registerCustomer({
      customerRegistrationId,
      company,
      user,
      userId: req.auth.payload.userId,
    });

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomerRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedCustomerRegistration(req.auth);
    const { customerRegistrationId } = req.auth.payload;
    const customerRegistration = await customerRegistrationService.getRegistration({
      customerRegistrationId,
    });
    if (!customerRegistration) throw new NotFoundException(Entity.CUSTOMER_REGISTRATION);
    const { passwordHash: _, ...customerRegistrationSafe } = customerRegistration;

    res.status(200).json(customerRegistrationSafe);
  } catch (error) {
    next(error);
  }
};
