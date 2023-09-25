const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../components/BadRequestError');
const ConflictError = require('../components/ConflictError');
const NotFoundError = require('../components/NotFoundError');
const UnauthorizedError = require('../components/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

/**
 * получение пользователя по ID
 */
module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователя с введенным _id не существует');
      }

      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Введен некорректный _id пользователя'));
      } else next(err);
    });
};

/**
 * изменение данных пользователя
 */
module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введен некорректный тип данных'));
      } else if (err.name === 'CastError') {
        next(new NotFoundError('Данного пользователя не существует'));
      } else next(err);
    });
};

/**
 * проверка наличия пользователя с возвратом email
 */
module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.send(false);
  }

  let id;
  try {
    id = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
    );
  } catch (err) {
    throw new UnauthorizedError('Token указан неверно');
  }

  return User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователя с введенным _id не существует');
      }

      res.send({ data: { email: user.email } });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Введен некорректный _id пользователя'));
      } else next(err);
    });
};

/**
 * авторизация пользователя
 */
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  /**
   * проверка наличия в БД пользователя с указанной почтой и проверка пароля
   * при успехе возвращается объект с данными пользователя
   */
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
        {
          expiresIn: '7d',
        },
      );

      /**
       * при удачной авторизации токен отправляется ввиде coockie
       */
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'Аторизация пройдена успешно.' });
    })
    .catch(next);
};

/**
 * удаление cookie пользователя (выход из аккаунта)
 */
module.exports.signout = (_, res, next) => {
  try {
    res.clearCookie('jwt');
    res.send({ message: 'Cookie cleared' });
  } catch (err) {
    next(err);
  }
};

/**
 * создание пользователя
 */
module.exports.createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  /**
   * создание хэша пароля
   */
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введен некорректный тип данных'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с такой почтой уже существует'));
      } else next(err);
    });
};
