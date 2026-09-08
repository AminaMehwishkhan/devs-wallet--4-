const { error } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  if (err.code === '23505') {
    return error(res, 'A record with this value already exists', 409);
  }
  if (err.code === '23503') {
    return error(res, 'Related record not found', 400);
  }

  return error(res, err.message || 'Internal server error', err.status || 500);
};

const notFound = (req, res) => error(res, `Route not found: ${req.originalUrl}`, 404);

module.exports = { errorHandler, notFound };
