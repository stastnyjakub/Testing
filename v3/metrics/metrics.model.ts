import Joi from '@hapi/joi';

import { EAuthRole } from '@/auth/types';
import { validateSchemaOrThrow } from '@/utils';

import { TGetMetricsQuery } from './types/request';

export const validateGetMetricsRequestQuery = (query: object, userRole: EAuthRole) => {
  let schema = Joi.object({
    carrierId: Joi.number().optional(),
    customerId: Joi.number().optional(),

    // Date is represented as a Unix timestamp
    startDate: Joi.number(),
    endDate: Joi.number(),
  });

  if (userRole === EAuthRole.Admin) {
    schema = schema.append({
      userId: Joi.number().optional(),
    });
  }

  return validateSchemaOrThrow<TGetMetricsQuery>(schema, query);
};
