import Joi from '@hapi/joi';
import { z, ZodSchema } from 'zod';

import { InvalidBodyException } from '@/errors';

/**
 * @throws {InvalidBodyException}
 */
export const validateSchemaOrThrow = <T>(schema: Joi.AnySchema, object: unknown) => {
  const { error, errors, value } = schema.validate(object);
  if (error || errors) throw new InvalidBodyException(error?.details);
  return value as T;
};

/**
 * @throws {InvalidBodyException}
 */
export const validateEntityId = (id: unknown) => {
  const schema = Joi.number().min(1).required();
  validateSchemaOrThrow(schema, id);
  return Number(id);
};

export function validatePayload<T extends ZodSchema>(schema: T, payload: unknown): z.infer<T> {
  const { success, data, error } = schema.safeParse(payload);

  if (!success) {
    throw new InvalidBodyException(error.message);
  }

  return data;
}
