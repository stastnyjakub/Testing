import { Response } from 'express';

export const logError = async (res: Response, error: Error, message?: string, status?: number) => {
  message = message || 'Něco se pokazilo';
  status = status || 500;
  if (process.env.ENVIRONMENT == 'development') {
    console.log(error);
    return res.status(status).json({ message, details: error.message, stack: error.stack });
  }
  return res.status(status).json({ message });
};
