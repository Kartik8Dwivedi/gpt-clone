class AppSuccess {
  constructor(data, message = "Success", statusCode = 200) {
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
