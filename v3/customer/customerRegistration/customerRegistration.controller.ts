import { NextFunction, Request, Response } from 'express';

import { Entity, NotFoundException } from '@/errors';
import { assertAuthenticatedCustomerRegistration } from '@/utils/validation/assertAuthenticated';

import {
  validateProcessCustomerRegistrationRequestRequestBody,
  validateRegisterCustomerRequestBody,
} from './customerRegistration.model';
import * as customerRegistrationService from './customerRegistration.service';

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
    const customerRegistration = await customerRegistrationService.getCustomerRegistration({
      customerRegistrationId,
    });
    if (!customerRegistration) throw new NotFoundException(Entity.CUSTOMER_REGISTRATION);
    const { passwordHash: _, ...customerRegistrationSafe } = customerRegistration;

    res.status(200).json(customerRegistrationSafe);
  } catch (error) {
    next(error);
  }
};
