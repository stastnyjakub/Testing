import { NextFunction, Request, Response } from 'express';

import { Entity, NotFoundException } from '@/errors';
import { downloadCsv, validateEntityId, validateId } from '@/utils';
import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';

import { invalidateTag } from '../websockets';

import * as customerUserService from './customerUser/customerUser.service';
import { validateListCustomersRequestQuery } from './listCustomers/listCustomers.model';
import { validateUpdateCustomerRequestBody } from './updateCustomer/updateCustomer.model';
import { CustomerBodyCreate, CustomerBodyUpdate } from './customer.interface';
import { validateParameters, validateRequestBodyCreate, validateRequestBodyUpdate } from './customer.model';
import { createCustomerOld, getCustomersList, removeCustomer, updateCustomerOld } from './customer.service';
import * as customerService from './customer.service';

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.customerId);
    const values = validateUpdateCustomerRequestBody(req.body);

    const customer = await customerService.updateCustomer({
      customerId,
      profilePicture: req.file?.filename,
      ...values,
    });

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export const customersList = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Customer']
    #swagger.description = 'Get all customers'
    #swagger.operationId = 'getCustomersList'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CustomersList'},
    }
  */
  try {
    const customers = await getCustomersList();
    return res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const getCustomerSelf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(req.auth);

    // Wait for 2 seconds to simulate a delay
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    const customerUser = await customerUserService.getCustomerUser({ userId: req.auth.payload.userId });
    if (!customerUser) throw new NotFoundException(Entity.CUSTOMER_USER);

    const customer = await customerService.getCustomer({ customerId: customerUser.customer_id });
    if (!customer) throw new NotFoundException(Entity.CUSTOMER);

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.id);
    const customer = await customerService.getCustomer({ customerId });
    if (customer === null) throw new NotFoundException(Entity.CUSTOMER);

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.customerId);

    const profilePicture = await customerService.getProfilePicture(customerId);
    if (profilePicture === null) throw new NotFoundException(Entity.CUSTOMER_PROFILE_PICTURE);
    const { content, contentType, name } = profilePicture;

    if (contentType) {
      res.contentType(contentType);
    }
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Disposition', `profilePicture; filename=${encodeURIComponent(name)}`);
    res.setHeader('Content-Length', content.length);
    res.status(200).send(content);
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset, search, ...filters } = validateListCustomersRequestQuery(req.query);

  const customers = await customerService.listCustomers({
    limit,
    offset,
    search,
    ...filters,
  });

  res.status(200).json(customers);
  try {
  } catch (error) {
    next(error);
  }
};

export const customerPost = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Customer']
    #swagger.description = 'Create customer'
    #swagger.operationId = 'createCustomer'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/V3CustomerCreateBody'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CustomerCreate'}
    }
  */
  const { error } = validateRequestBodyCreate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { customerContacts, locations, ...customer }: CustomerBodyCreate = req.body;
  try {
    const createdCustomer = await createCustomerOld({
      customer,
      customerContacts: customerContacts.toCreate,
      locations: locations.toCreate,
    });

    invalidateTag('Customers');
    return res.json(createdCustomer);
  } catch (e: any) {
    next(e);
  }
};

export const customerPut = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Customer']
    #swagger.description = 'Update customer'
    #swagger.operationId = 'updateCustomer'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      required: true,
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/V3CustomerUpdateBody'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CustomerUpdate'}
    }
  */
  const validatedCustomerId = validateId(req.params.id);
  if (typeof validatedCustomerId === 'string') return res.status(400).send({ message: 'Neplatné ID' });

  const { error } = validateRequestBodyUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { customerContacts, locations, ...customer }: CustomerBodyUpdate = req.body;

  try {
    const updatedCustomer = await updateCustomerOld(validatedCustomerId, customer, customerContacts, locations);

    invalidateTag('Customers');
    return res.json(updatedCustomer);
  } catch (e: any) {
    next(e);
  }
};

export const customerDelete = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Customer']
    #swagger.description = 'Delete customer'
    #swagger.operationId = 'deleteCustomer'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Customer ID',
      required: true,
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/V3CustomerDelete'}
    }
  */
  const { id } = req.params;
  const validatedCustomerId = validateId(id);
  if (typeof validatedCustomerId === 'string') return res.status(400).send({ message: 'Neplatné ID' });
  try {
    await removeCustomer(validatedCustomerId);

    invalidateTag('Customers');
    return res.send();
  } catch (e: any) {
    next(e);
  }
};

export const customersExportToCsv = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - Customer']
    #swagger.description = 'Get customers and export to CSV'
    #swagger.operationId = 'getCustomersCsv'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    } 
  */
  const { error } = validateParameters(req.query);
  if (error) return res.status(400).send({ message: error.details[0].message });
  try {
    req.query.limit = `${Number.MAX_SAFE_INTEGER}`;
    req.query.offset = '0';
    const { customers } = await customerService.listCustomers(req.query);
    if (customers == null || customers.length === 0) {
      return res.status(404).send({ message: 'Zákazníky se nepodařilo načíst' });
    }
    const fields = [
      { label: 'číslo', value: 'customer_id' },
      { label: 'firma', value: 'company' },
      { label: 'ulice', value: 'street' },
      { label: 'psč', value: 'postalCode' },
      { label: 'země', value: 'country' },
      { label: 'poznámka', value: 'note' },
    ];
    return downloadCsv(res, 'customers', fields, customers);
  } catch (e: any) {
    next(e);
  }
};
