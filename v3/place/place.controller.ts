import { NextFunction, Request, Response } from 'express';

import { validateListPlacesRequestQuery, validateUpdatePlacesRequestBody } from './place.model';
import * as placeService from './place.service';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dispatcherId } = validateListPlacesRequestQuery(req.query);

    const places = await placeService.listPlaces({ dispatcherId });

    res.status(200).json(places);
  } catch (error) {
    next(error);
  }
};

export const updateMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { places } = validateUpdatePlacesRequestBody(req.body);
    const updatedPlaces = await placeService.updatePlaces(places);

    res.status(200).json(updatedPlaces);
  } catch (error) {
    next(error);
  }
};
