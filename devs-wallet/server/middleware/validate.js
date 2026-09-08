const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

// Runs after an array of express-validator checks; short-circuits with a
// 422 + formatted error list if any validation rule failed.
const handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return error(res, 'Validation failed', 422, errors);
  }
  next();
};

module.exports = { handleValidation };
