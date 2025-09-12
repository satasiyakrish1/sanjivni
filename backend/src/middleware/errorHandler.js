// Using console for logging instead of winston logger

class ApiError extends Error {
  constructor(statusCode, message, extras = {}) {
    super(message);
    this.statusCode = statusCode;
    this.extras = extras;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Resource not found - ${req.originalUrl}`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log the error
  console.error('API Error:', {
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || 500,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    extras: err.extras
  });

  // Handle specific error types
  if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    error = new ApiError(400, 'Invalid JSON payload');
  }

  // Send response
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.extras && { details: err.extras })
  });
};

module.exports = {
  ApiError,
  notFound,
  errorHandler
};