import { NextFunction, Request, Response } from 'express';

import { Entity, NotFoundException } from '@/errors';
import { validateEntityId } from '@/utils';

import { validateListVehiclesRequestQuery, validateUpdateVehicleRequestBody } from './vehicle.model';
import * as vehicleService from './vehicle.service';

export const listVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dispatcherId } = validateListVehiclesRequestQuery(req.query);

    const vehicles = await vehicleService.listVehicles({ dispatcherId });

    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

export const getVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleId = validateEntityId(req.params.id);

    const vehicle = await vehicleService.getVehicle(vehicleId);
    if (vehicle === null) throw new NotFoundException(Entity.VEHICLE);

    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleId = validateEntityId(req.params.id);
    const { vehicleTypeId, maxHeight, maxWeight, maxLength, maxWidth, vehicleFeatures } =
      validateUpdateVehicleRequestBody(req.body);

    const updatedVehicle = await vehicleService.updateVehicle({
      vehicleId,
      vehicleTypeId,
      maxHeight,
      maxWeight,
      maxLength,
      maxWidth,
      vehicleFeatures,
    });

    res.status(200).json(updatedVehicle);
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const listVehicleTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleTypes = await vehicleService.listVehicleTypes();

    res.status(200).json(vehicleTypes);
  } catch (error) {
    next(error);
  }
};
export const getVehicleType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicleTypeId = validateEntityId(req.params.id);
    const vehicleTypes = await vehicleService.getVehicleType(vehicleTypeId);

    res.status(200).json(vehicleTypes);
  } catch (error) {
    next(error);
  }
};
