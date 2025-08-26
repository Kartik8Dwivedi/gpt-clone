class AppSuccess<T> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  error: null;

  constructor(data: T | null, message: string = "Success", statusCode: number = 200) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.error = null;
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      error: this.error,
    };
  }
}

export default AppSuccess;
