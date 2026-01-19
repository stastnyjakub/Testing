import Joi from '@hapi/joi';

import { timestamp } from '../timestamp';

export const validateTimestamp = (value: any, helpers: Joi.CustomHelpers<any>) => {
  const convertedValue = timestamp(value);
  if (convertedValue === null || convertedValue.isValid() === false) {
    return helpers.message({ custom: 'timestamp.invalid' });
  }
  return value;
};
