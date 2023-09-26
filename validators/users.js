const { Joi, celebrate } = require('celebrate');

module.exports.getUserVal = celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }),
});

module.exports.updateProfileVal = celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }),
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
});
