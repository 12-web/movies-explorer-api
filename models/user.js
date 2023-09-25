const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UnauthorizedError = require('../components/UnauthorizedError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
    select: false,
  },
});

/**
 * метод проверки почты и пароля пользователя с данными из БД
 * @param { String } email - email пользователя
 * @param { String } password - пароль пользователя
 * @returns { Object } user - объект пользователя с данными
 */
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) throw new UnauthorizedError('Неверные почта или пароль');
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) throw new UnauthorizedError('Неверные почта или пароль');

        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
