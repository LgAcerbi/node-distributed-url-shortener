import { AppError } from './app-error.js';
import { ErrorType } from './error-type.js';

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, ErrorType.VALIDATION);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
