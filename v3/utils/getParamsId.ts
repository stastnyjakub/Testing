import { Request } from 'express';

import { InvalidIdException } from '../errors';

export const getParamsId = (req: Request) => {
  const { id } = req.params;
  const parsedId = Number(id);
  if (isNaN(parsedId)) {
    throw new InvalidIdException();
  }
  return parsedId;
};
