import * as Joi from '@hapi/joi';

export const validateParameters = (params: object) => {
  const schema = Joi.object({
    ico: Joi.string().required(),
  });
  return schema.validate(params);
};
