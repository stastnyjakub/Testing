import * as Joi from '@hapi/joi';
//validation
export const validateListFilesQuery = (query: object) => {
  const schema = Joi.object({
    directory: Joi.string().required().valid('invoices').valid('order'),
    id: Joi.number().min(1).required(),
  });
  return schema.validate(query);
};

export const validateFilePathQuery = (query: object) => {
  const schema = Joi.object({
    filePath: Joi.string().required(),
  });
  return schema.validate(query);
};
