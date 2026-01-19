import { NextFunction, Request, Response } from 'express';

import { validatePayload } from '@/utils';

import { forwardRequestQuerySchema, reverseRequestQuerySchema } from './geocoding.model';
import * as geocodingService from './geocoding.service';

export const forward = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = validatePayload(forwardRequestQuerySchema, req.query);

    const results = await geocodingService.searchLocationByText(search, req.lang);

    res.status(200).json(results);
  } catch (e) {
    next(e);
  }
};

export const reverse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude } = validatePayload(reverseRequestQuerySchema, req.query);
    const results = await geocodingService.getLocationByCoords({ latitude, longitude, lang: req.lang });

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
