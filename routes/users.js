const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const auth = require('../middlewares/auth');
const { getUser, updateProfile } = require('../controllers/users');

router.get('/me', celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }),
}), auth, getUser);

router.patch('/me', celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), auth, updateProfile);

module.exports = router;
