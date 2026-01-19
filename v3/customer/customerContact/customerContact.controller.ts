import { NextFunction, Request, Response } from 'express';

import { Entity, NotFoundException } from '@/errors';
import { validateEntityId } from '@/utils';

import {
  validateCreateCustomerContactRequestBody,
  validateUpdateCustomerContactRequestBody,
} from './customerContact.model';
import * as customerContactService from './customerContact.service';

export const getCustomerContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerContactId = validateEntityId(req.params.customerContactId);
    const customerContact = await customerContactService.getCustomerContact(customerContactId);

    if (customerContact === null) throw new NotFoundException(Entity.CUSTOMER_CONTACT);

    res.status(200).json(customerContact);
  } catch (error) {
    next(error);
  }
};

export const listCustomerContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.customerId);
    const customerContacts = await customerContactService.listCustomerContacts({ customerId });

    res.status(200).json(customerContacts);
  } catch (error) {
    next(error);
  }
};

export const createCustomerContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.customerId);
    const { email, phone, name, surname } = validateCreateCustomerContactRequestBody(req.body);

    const createdContact = await customerContactService.createCustomerContact({
      customerId,
      email,
      phone,
      name,
      surname,
    });

    res.status(201).json(createdContact);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerContactId = validateEntityId(req.params.customerContactId);
    const { email, phone, name, surname } = validateUpdateCustomerContactRequestBody(req.body);

    const updatedContact = await customerContactService.updateCustomerContact({
      customerContactId,
      email,
      phone,
      name,
      surname,
    });

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerContactId = validateEntityId(req.params.customerContactId);
    await customerContactService.deleteCustomerContact({ customerContactId });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
