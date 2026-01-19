import { NextFunction, Request, Response } from 'express';

import * as countryService from './country.service';

export const listCountries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const countries = await countryService.listCountries();

    res.status(200).json(countries);
  } catch (error) {
    next(error);
  }
};
