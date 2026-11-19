const ApiResponse = require('../utils/apiResponse');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return ApiResponse.error(res, 'Validation failed', 400, formattedErrors);
      }
      return ApiResponse.error(res, error.message || 'Validation error', 400);
    }
  };
};

module.exports = validate;
