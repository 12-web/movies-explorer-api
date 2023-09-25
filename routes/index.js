const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createUser,
  login,
  signout,
  checkUser,
} = require('../controllers/users');

router.get('/', checkUser);

router.post('/signout', signout);

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
    }),
  }),
  createUser,
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

module.exports = router;
