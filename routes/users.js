const router = require('express').Router();
const auth = require('../middlewares/auth');
const { getUser, updateProfile } = require('../controllers/users');

router.get('/me', auth, getUser);
router.patch('/me', auth, updateProfile);

module.exports = router;
