const router = require('express').Router();
const auth = require('../middlewares/auth');
const { getUser, updateProfile } = require('../controllers/users');
const { getUserVal, updateProfileVal } = require('../validators/users');

router.get('/me', auth, getUserVal, getUser);

router.patch('/me', auth, updateProfileVal, updateProfile);

module.exports = router;
