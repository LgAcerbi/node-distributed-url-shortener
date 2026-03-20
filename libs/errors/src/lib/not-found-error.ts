import { AppError } from './app-error.js';
import { ErrorType } from './error-type.js';

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, ErrorType.NOT_FOUND);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
