const Joi = require("@hapi/joi");

//validation
const validate = carousel => {
  const schema = Joi.object({
    email: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat email.`
      }),
    password: Joi.string()
      .allow(null, "")
      .required()
      .messages({
        "any.required": `Je nutné zadat heslo.`
      })
  });
  return schema.validate(carousel);
};

exports.validateLogin = validate;
