import CustomError from './CustomError';

export default class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
  }

  errorMessageJson() {
    return {
      error: this.message,
    };
  }
}
