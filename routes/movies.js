const router = require('express').Router();
const auth = require('../middlewares/auth');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { getUserMoviesVal, createMovieVal, deleteMovieVal } = require('../validators/movies');

router.get('/', auth, getUserMoviesVal, getMovies);

router.post('/', auth, createMovieVal, createMovie);

router.delete('/:movieId', auth, deleteMovieVal, deleteMovie);

module.exports = router;
