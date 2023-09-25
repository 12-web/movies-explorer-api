const { Joi, celebrate } = require('celebrate');
const linkRegex = require('../utils/utils');

module.exports.getUserMoviesVal = celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }),
});

module.exports.createMovieVal = celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }),
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(linkRegex),
    trailerLink: Joi.string().required().pattern(linkRegex),
    thumbnail: Joi.string().required().pattern(linkRegex),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
});

module.exports.deleteMovieVal = celebrate({
  cookies: Joi.object().keys({
    jwt: Joi.string().required(),
  }),
  params: Joi.object().keys({
    movieId: Joi.string().length(24).hex().required(),
  }),
});
