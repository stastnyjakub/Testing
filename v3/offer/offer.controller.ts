import { NextFunction, Request, Response } from 'express';

import { getParamsId } from '@/utils';

import { CreateBody, UpdateBody } from './offer.interface';
import { validateCreateBody, validateUpdateBody } from './offer.model';
import { createOffer, deleteOffer, updateOffer } from './offer.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Offer']
    #swagger.description = 'Create offer'
    #swagger.operationId = 'createOffer'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/OfferCreateBody'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/OfferGetResponse'},
    }
  */
  try {
    validateCreateBody(req.body);

    const body = req.body as CreateBody;

    // If caller is a dispatcher, his id must match dispatcher_id in request body
    // if (req.auth.payload.role === AuthRole.DISPATCHER && req.auth.payload.dispatcher_id !== body.dispatcherId) {
    //   throw new UnauthorizedException('offer.dispatcherMismatch');
    // }

    const offer = await createOffer(body);
    return res.json(offer);
  } catch (e) {
    next(e);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Offer']
    #swagger.description = 'Update offer'
    #swagger.operationId = 'updateOffer'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'offer ID',
        required: true,
      }
    #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/definitions/OfferUpdateBody'}
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/OfferSimpleGetResponse'},
    }
  */
  try {
    const offerId = getParamsId(req);
    validateUpdateBody(req.body);

    const body = req.body as UpdateBody;
    const updatedOffer = await updateOffer({ ...body, offerId });

    return res.json(updatedOffer);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Offer']
    #swagger.description = 'Delete offer'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'offer ID',
        required: true,
      }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/OfferSimpleGetResponse'},
    }
  */
  try {
    const offerId = getParamsId(req);

    // If caller is a dispatcher, he must be the creator of the offer to delete it
    // if (req.auth.payload.role === AuthRole.DISPATCHER) {
    //   await checkDispatcherCanDelete(offerId, req.auth.payload.dispatcher_id);
    // }

    const deletedOffer = await deleteOffer(offerId);
    res.json(deletedOffer);
  } catch (e) {
    next(e);
  }
};
