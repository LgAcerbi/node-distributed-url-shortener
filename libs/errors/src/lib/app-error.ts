import type { ErrorTypeValue } from './error-type.js';

export interface AppErrorShape {
    message: string;
    type: string;
}

/**
 * Base error for application layers. Has `message` and `type`; the HTTP layer
 * uses `type` to decide status code (e.g. NOT_FOUND -> 404) without putting
 * HTTP concerns in domain/application code.
 * Later extensions can be added for GRPC, AMQP, etc.
 */
export class AppError extends Error implements AppErrorShape {
    readonly type: string;

    constructor(message: string, type: ErrorTypeValue | string) {
        super(message);
        this.type = type;
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
