import { NextFunction, Request, Response } from 'express';

import { Entity } from '../errors';
import { Lang } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    lang: Lang;
    entityName: Entity;
  }
}

export const additions = (req: Request, res: Response, next: NextFunction) => {
  try {
    const entityName = req.url.split('/api/v3/')?.[1].split('/')[0] as Entity;
    req.entityName = entityName;
  } catch (_) {
    req.entityName = Entity.GLOBAL;
  }
  try {
    let acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage && acceptLanguage.length > 2) {
      acceptLanguage = acceptLanguage.split('-')[0];
    }
    const lang = (acceptLanguage as Lang) || 'cs';
    req.lang = lang;
  } catch (_) {
    req.lang = 'cs';
  }
  next();
};
