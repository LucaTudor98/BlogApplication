import CustomError from './CustomError';

export default class NotFoundError extends CustomError {
  statusCode = 404;

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
