import { NextFunction, Request, Response } from 'express';

type TDefaultContentTypeOptions = {
  defaultType?: string;
};
export const defaultContentType = (options?: TDefaultContentTypeOptions) => {
  const { defaultType } = options || {};
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.headers['content-type']) {
      req.headers['content-type'] = defaultType || 'application/octet-stream';
    }
    next();
  };
};
