const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { dbConn, rateLimiterConfig } = require('./utils/config');

dotenv.config();
const {
  PORT = 3000,
  NODE_ENV,
  ORIGIN,
  DB_CONN,
} = process.env;
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

app.use(requestLogger);

const limiter = rateLimit(rateLimiterConfig);

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
mongoose.connect(NODE_ENV === 'production' ? DB_CONN : dbConn, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  autoIndex: true,
});

app.use(errorLogger);

/**
 * установка роутов
 */
app.use('/', require('./routes'));

/**
 * обработка ошибок
 */

app.use(errors());
app.use(errorHandler);

/**
 * установка порта для сервера
 */
app.listen(PORT, () => {
  console.log(`Ссылка на сервер: ${PORT}`);
});
