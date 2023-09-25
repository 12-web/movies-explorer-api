const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../components/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

/**
 * миддлвар проверки токена пользователя
 */
module.exports = (req, _, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  let payload;
  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
    );
  } catch (err) {
    throw new UnauthorizedError('Token указан неверно');
  }

  req.user = payload;
  return next();
};
