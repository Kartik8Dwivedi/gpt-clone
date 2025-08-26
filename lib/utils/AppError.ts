class AppError extends Error {
  statusCode: number;
  success: boolean;
  data: any;
  error: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.error = message;

    Object.setPrototypeOf(this, AppError.prototype); // Correctly set the prototype chain
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
