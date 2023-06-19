const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}: ${err.value}`;
  return new AppError(msg, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);

  // const msg = `Duplicate field value: ${err.keyValue.name}. Please use another value`;
  const msg = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(msg, 400);
};
const handleValidationErrors = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const msg = `Invalid Input data. ${errors.join('. ')}`;
  return new AppError(msg, 400);
};

function handleJWTError() {
  return new AppError('Invalid token. Please log in again!', 401);
}
function handleExpiredToken() {
  return new AppError('Token is expired. Please log in again!', 401);
}
function sendErrorDev(res, err) {
  res.status(err.statusCode).json({
    error: err,
    status: err.status,
    message: err.message,
    stack: err.stack
  });
}
function sendErrorProd(res, err) {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  //Programming or other unknown error: don't leak error details
  else {
    //1) log error
    console.error('ERROR', err);
    //2 Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleExpiredToken();
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(error);

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrors(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleExpiredToken();
    sendErrorProd(res, error);
  }
};
