class CustomError {
  static createError({ name = "Error", cause, message, code = 500 }) {
    const error = new Error(message, { cause });
    error.name = name;
    error.code = code;
    throw error;
  }
}

module.exports = CustomError;
