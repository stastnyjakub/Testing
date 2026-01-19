import * as Joi from '@hapi/joi';

import { EWSSMessageEvent } from './websockets.interface';

export const validateMessage = (body: object) => {
  const schema = Joi.object({
    event: Joi.string().valid(...Object.values(EWSSMessageEvent)),
    data: Joi.any(),
  });
  const { value, error } = schema.validate(body);
  return {
    error,
    value: value as
      | {
          event: EWSSMessageEvent;
          data: any;
        }
      | undefined,
  };
};
