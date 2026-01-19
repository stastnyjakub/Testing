import { NextFunction, Request, Response } from 'express';

import { validateParameters } from './ares.model';
import { getAresData } from './ares.service';

export const getSubjectDetail = async (req: Request, res: Response, next: NextFunction) => {
  /*
      #swagger.tags = ['V3 - Ares']
      #swagger.description = 'Get subject info'
      #swagger.operationId = 'getAresInfo'
      #swagger.parameters['x-auth-token'] = {
        in: 'header',
        description: 'JWT token',
      }
      #swagger.parameters['ico'] = {
        in: 'query',
        description: 'IČO of subject',
        type: 'string',
      }
      #swagger.responses[200] = {
        schema: {$ref: '#/definitions/AresInfoGetResponse'},
      }
    */
  const { query } = req;
  const { error } = validateParameters(query);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const data = await getAresData(query.ico as unknown as string);
    res.send(data);
  } catch (e) {
    next(e);
  }
};
