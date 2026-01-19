import Joi from '@hapi/joi';

export const JoiStringNullish = () => Joi.string().allow(null).optional();
export const JoiNumberNullish = () => Joi.number().allow(null).optional();
export const JoiBooleanNullish = () => Joi.boolean().allow(null).optional();

export const JoiStringOptional = () => Joi.string().optional();
export const JoiNumberOptional = () => Joi.number().optional();
export const JoiBooleanOptional = () => Joi.boolean().optional();

export const JoiStringNullable = () => Joi.string().allow(null).required();
export const JoiNumberNullable = () => Joi.number().allow(null).required();
export const JoiBooleanNullable = () => Joi.boolean().allow(null).required();
