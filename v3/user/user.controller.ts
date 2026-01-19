import { NextFunction, Request, Response } from 'express';

import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';

import { validateCheckEmailAvailabilityRequestQuery } from './user.model';
import * as userService from './user.service';

export const getUsersList = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['V3 - User']
    #swagger.description = 'Get all users'
    #swagger.operationId = 'getUsersList'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.responses[200] = {
      schema: {$ref: '#/definitions/UsersList'},
    }
    */
  try {
    const users = await userService.getUsersList();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const checkEmailAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(req.auth);
    const { email } = validateCheckEmailAvailabilityRequestQuery(req.query);

    const isEmailAvailable = await userService.getIsEmailAvailable({ email, userId: req.auth.payload.userId });
    res.status(200).json({
      available: isEmailAvailable,
    });
  } catch (error) {
    next(error);
  }
};

export const checkTokenValidity = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
