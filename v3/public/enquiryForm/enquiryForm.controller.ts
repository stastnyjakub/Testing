import { NextFunction, Request, Response } from 'express';
import path from 'path';

import {
  validateCalculateCommissionPriceEstimationRequestBody,
  validateHandleEnquiryFormRequestBody,
} from './enquiryForm.model';
import * as enquiryFormService from './enquiryForm.service';

export const calculateCommissionPriceEstimation = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry Form']
    #swagger.description = 'Calculate commission price estimation'
    #swagger.operationId = 'calculateCommissionPriceEstimation'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: '#/definitions/CalculateCommissionPriceEstimationRequestBody'
      }
    }
    #swagger.responses[2O0] = {
      schema: { $ref: '#/definitions/CalculateCommissionPriceEstimationResponseBody' },
    }
  */
  try {
    const body = validateCalculateCommissionPriceEstimationRequestBody(req.body);

    const estimatedPrice = await enquiryFormService.calculateCommissionPriceEstimation(body, req.ip);

    res.status(200).send(estimatedPrice);
  } catch (error) {
    next(error);
  }
};

export const handleEnquiryForm = async (req: Request, res: Response, next: NextFunction) => {
  /*
    #swagger.tags = ['Enquiry Form']
    #swagger.description = 'Handle enquiry form'
    #swagger.operationId = 'handleEnquiryForm'
    #swagger.parameters['x-auth-token'] = {
      in: 'header',
      description: 'JWT token',
    }
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: '#/definitions/HandleEnquiryFormRequestBody'
      }
    }
    #swagger.responses[2O0] = {
      description: 'OK',
    }
  */
  try {
    const body = validateHandleEnquiryFormRequestBody(req.body);

    await enquiryFormService.createCommissionEnquiry(body);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const downloadEnquiryFormScript = (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.sendFile(path.join(__dirname, 'scripts', 'webflowEnquiryFormScript.js'));
  } catch (error) {
    next(error);
  }
};
