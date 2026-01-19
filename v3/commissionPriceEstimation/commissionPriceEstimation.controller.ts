import { NextFunction, Request, Response } from 'express';

import * as commissionPriceEstimationService from '@/commissionPriceEstimation/commissionPriceEstimation.service';
import { Entity, HttpException, NotFoundException } from '@/errors';

import { validateGetEstimationRequestParameters } from './commissionPriceEstimation.model';

export const getEstimation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estimationCode } = validateGetEstimationRequestParameters(req.params);
    const estimationEntity = await commissionPriceEstimationService.getEstimationEntityOrThrow({
      code: estimationCode,
    });
    if (estimationEntity === null) {
      throw new NotFoundException(Entity.COMMISSION_PRICE_ESTIMATION);
    }
    const { commission_id, customer_id, code, minPrice, maxPrice, email, parameters } = estimationEntity;

    // If commission or customer is already assigned to this estimation, enquiry was already created
    if (commission_id || customer_id) {
      throw new HttpException(422, 'commissionPriceEstimation.estimationAlreadyUsed');
    }

    res.status(200).send({
      code,
      maxPrice,
      minPrice,
      email,
      parameters,
      commission_id,
      customer_id,
    });
  } catch (error) {
    next(error);
  }
};
