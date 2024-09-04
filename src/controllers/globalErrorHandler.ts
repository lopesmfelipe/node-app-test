import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

interface CustomError extends Error {
  status?: string;
  statusCode?: number;
  isOperational?: boolean;
  code?: number;
}

// HANDLE INVALID DATABASE IDs FORMAT
const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// HANDLE DUPLICATE FIELD ERROR
const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/("')(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another one`;
  return new AppError(message, 400);
};

// HANDLE VALIDATION ERROR
const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: CustomError, res: Response) => {
  res.status(err.statusCode ?? 500).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err: CustomError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode ?? 500).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR😵", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

// Global error handling middleware
const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);

  } else if (process.env.NODE_ENV === "production") {

    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export default globalErrorHandler;
