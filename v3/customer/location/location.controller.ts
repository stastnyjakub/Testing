import { NextFunction, Request, Response } from 'express';

import { Entity, NotFoundException } from '@/errors';
import { validateEntityId } from '@/utils';

import { validateCreateLocationRequestBody, validateUpdateLocationRequestBody } from './location.model';
import * as locationService from './location.service';

export const getLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locationId = validateEntityId(req.params.locationId);
    const location = await locationService.getLocation(locationId);

    if (location === null) throw new NotFoundException(Entity.LOCATION);

    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const listLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.customerId);
    const locations = await locationService.listLocations({ customerId });

    res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = validateEntityId(req.params.customerId);
    const values = validateCreateLocationRequestBody(req.body);
    const location = await locationService.createLocation({ customerId, ...values });

    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locationId = validateEntityId(req.params.locationId);
    const values = validateUpdateLocationRequestBody(req.body);
    values.ramps;
    const location = await locationService.updateLocation({ locationId, ...values });

    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locationId = validateEntityId(req.params.locationId);
    await locationService.deleteLocation(locationId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
