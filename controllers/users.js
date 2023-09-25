const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../components/BadRequestError');
const ConflictError = require('../components/ConflictError');
const NotFoundError = require('../components/NotFoundError');

const { NODE_ENV, JWT_SECRET } = process.env;

/**
 * получение пользователя по ID
 */
module.exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('Пользователя с введенным _id не существует');
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Введен некорректный _id пользователя'));
    } else next(err);
  }
};

/**
 * изменение данных пользователя
 */
module.exports.updateProfile = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      {
        new: true,
        runValidators: true,
      },
    );
    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Введен некорректный тип данных'));
    } else if (err.name === 'CastError') {
      next(new NotFoundError('Данного пользователя не существует'));
    } else if (err.code === 11000) {
      next(new ConflictError('Пользователь с такой почтой уже существует'));
    } else next(err);
  }
};

/**
 * авторизация пользователя
 */
module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  /**
   * проверка наличия в БД пользователя с указанной почтой и проверка пароля
   * при успехе возвращается объект с данными пользователя
   */
  try {
    const user = await User.findUserByCredentials(email, password);
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
  } catch (err) {
    next(err);
  }
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
module.exports.createUser = async (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  /**
   * создание хэша пароля
   */
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name });
    res.status(201).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Введен некорректный тип данных'));
    } else if (err.code === 11000) {
      next(new ConflictError('Пользователь с такой почтой уже существует'));
    } else next(err);
  }
};
