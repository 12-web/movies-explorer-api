const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const NotFoundError = require('./components/NotFoundError');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

dotenv.config();
const { PORT = 3000, NODE_ENV, ORIGIN } = process.env;
const app = express();

/**
 * безопасность приложения (количество запросов и заголовки)
 */
app.use(
  cors({
    origin: NODE_ENV === 'production' ? ORIGIN : 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(helmet());

/**
 * добавление парсеров
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * предотвращение возврата полей, для которых установлено select: false
 */
mongoose.set('toObject', { useProjection: true });
mongoose.set('toJSON', { useProjection: true });

/**
 * подключение базы данных
 */
mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  autoIndex: true,
});

app.use(requestLogger);
// app.use((req, res) => {
//   req.user._id = 'asdasdasd';
// });

/**
 * установка роутов
 */
app.use('/', require('./routes'));
app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.use(errorLogger);
/**
 * обработка ошибок
 */
app.all('*', () => {
  throw new NotFoundError('Задан неверный путь');
});

app.use(errors());
app.use(errorHandler);

/**
 * установка порта для сервера
 */
app.listen(PORT, () => {
  console.log(`Ссылка на сервер: ${PORT}`);
});
