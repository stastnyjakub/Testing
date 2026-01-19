import { NextFunction, Request, Response } from 'express';

import { tunnelAction } from './sentry.service';

export const tunnel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const envelope: Buffer = req.body;

    const response = await tunnelAction(envelope);

    return res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};
