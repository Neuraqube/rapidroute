import {
  ValidationError,
  UniqueConstraintError,
  DatabaseError,
  ConnectionError,
  ForeignKeyConstraintError,
} from 'sequelize';
import env from '#configs/env';

/**
 * Global error handler function that logs errors and handles different types of Sequelize errors.
 *
 * @param {Error} error - The error object to be handled
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @return {Object} - The response object with appropriate error handling
 */
export const globalErrorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  if (error instanceof ValidationError) {
    return res.status(400).json({
      status: false,
      message: 'Validation Error',
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  // Handle foreign key errors
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      status: false,
      message: 'Foreign Key Constraint Error',
      errors: {
        fields: error.fields[0],
        message: `${error.fields[0]} is invalid or doesn't exist`,
      },
    });
  }

  // Handle unique constraint errors
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      status: false,
      message: 'Email already exists',
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  // Handle other Sequelize errors
  if (error instanceof DatabaseError) {
    return res.status(500).json({
      status: false,
      message: 'Database error occurred',
      details: error.message,
    });
  }

  // Handle connection errors
  if (error instanceof ConnectionError) {
    return res.status(503).json({
      status: false,
      message: 'Database connection error',
      details: error.message,
    });
  }

  // Handle internal errors
  if (error.httpStatus && error.message) {
    return res
      .status(error.httpStatus)
      .json({ status: false, message: error.message });
  }

  // ESLINT-disable-next-line no-lonely-if
  if (typeof error === 'string') next(error);

  // Handle generic errors
  return res.status(500).json({
    status: false,
    message: 'Internal Server Error',
    details: env.NODE_ENV === 'development' ? error.message : undefined, // Expose details only in development
  });
};

