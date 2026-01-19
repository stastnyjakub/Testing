import { NextFunction, Request, Response } from 'express';

import * as bankService from './bank.service';

export const getKBAccounts = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Bank']
    #swagger.description = 'Get all KB bank accounts'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: { $ref: '#/definitions/GetKBAccountsResponseBody' },
    }
  */
  try {
    const accounts = await bankService.getKbAccounts();

    res.status(200).json(accounts);
  } catch (error) {
    next(error);
  }
};
