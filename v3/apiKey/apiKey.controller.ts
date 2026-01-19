import { NextFunction, Request, Response } from 'express';

import * as apiKeyService from '@/apiKey/apiKey.service';

import { validateCreateApiKeyRequestBody } from './apiKey.model';

export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = validateCreateApiKeyRequestBody(req.body);

    const apiKeyEntity = await apiKeyService.createApiKey(role);

    res.status(201).json(apiKeyEntity);
  } catch (error) {
    next(error);
  }
};
