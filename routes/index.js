const router = require('express').Router();
const NotFoundError = require('../components/NotFoundError');
const {
  createUser,
  login,
  signout,
} = require('../controllers/users');
const auth = require('../middlewares/auth');
const { createUserVal, loginUserVal } = require('../validators');

router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

router.post('/signout', auth, signout);

router.post(
  '/signup',
  createUserVal,
  createUser,
);

router.post(
  '/signin',
  loginUserVal,
  login,
);

/**
 * обработка неверного пути
 */
router.all('*', () => {
  throw new NotFoundError('Задан неверный путь');
});

module.exports = router;
