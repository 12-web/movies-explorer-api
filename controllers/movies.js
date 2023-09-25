const ForbiddenError = require('../components/BadRequestError');
const BadRequestError = require('../components/BadRequestError');
const NotFoundError = require('../components/NotFoundError');
const Movie = require('../models/movie');

/**
 * полечение карточек из БД
 */
module.exports.getMovies = (_, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

/**
 * удаление карточки
 */
module.exports.deleteMovie = (req, res, next) => {
  Movie.findOne({
    _id: req.params.movieId,
  })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильма с введенным _id не существует');
      }

      /**
       * проверка прав удаления карточки текущим пользователем
       * удалить карточку может только пользователь, создавший карточку
       */
      if (movie.owner._id.toString() !== req.user._id) {
        throw new ForbiddenError('У данного пользователя нет прав для удаления фильма');
      }

      /**
       * удаление карточки и возвращение пользователю сообщения со статусом
       */
      return Movie.deleteOne({ _id: req.params.movieId }).then(() => res.send({ message: 'фильм успешно удален' }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Введен некорректный тип данных (_id)'));
      } else next(err);
    });
};

/**
 * создание фильма
 */
module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: { _id: req.user._id },
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(err.message));
      } else next(err);
    });
};
