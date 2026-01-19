import { NextFunction, Request, Response } from 'express';

import { EAuthRole } from '@/auth/types';
import { Entity, NotFoundException, UnauthorizedException } from '@/errors';
import * as userService from '@/user/user.service';
import { assertAuthenticatedUser } from '@/utils/validation/assertAuthenticated';

import { validateGetMetricsRequestQuery } from './metrics.model';
import { getMetricForAdmin, getMetricsForEmployee } from './metrics.service';

export const getMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    assertAuthenticatedUser(req.auth);
    const userId = req.auth.payload.userId;
    const user = await userService.getUser({ userId });
    if (!user) throw new NotFoundException(Entity.USER);

    const userRole = user.userRoles[0].role.name as EAuthRole;

    const query = validateGetMetricsRequestQuery(req.query, userRole);
    //return res.status(400).json({ message: 'Invalid query' });
    if (userRole === EAuthRole.Admin) {
      const metrics = await getMetricForAdmin(query);
      return res.status(200).json(metrics);
    }

    if (userRole === EAuthRole.QaplineEmployee) {
      // Employee can only see their own metrics
      const metrics = await getMetricsForEmployee({ ...query, userId });
      return res.status(200).json(metrics);
    }

    throw new UnauthorizedException();
  } catch (error) {
    next(error);
  }
};
