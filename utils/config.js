module.exports.dbConn = 'mongodb://127.0.0.1:27017/bitfilmsdb';

module.exports.rateLimiterConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
};
