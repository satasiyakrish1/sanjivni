const { validationResult, body } = require('express-validator');
const { ApiError } = require('./errorHandler');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    throw new ApiError(400, 'Validation failed', {
      errors: errorMessages
    });
  }
  next();
};

// Request validation rules
const herbalRemedyValidationRules = [
  body('symptoms')
    .isString()
    .withMessage('Symptoms must be a string')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Please provide at least 10 characters of symptoms description')
    .isLength({ max: 1000 })
    .withMessage('Symptoms description cannot exceed 1000 characters')
];

module.exports = {
  validateRequest,
  herbalRemedyValidationRules
};
