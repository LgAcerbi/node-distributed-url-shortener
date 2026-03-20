/**
 * Error types used by application layers. The HTTP layer maps these to status codes
 * (e.g. NOT_FOUND -> 404) so domain/application code stays free of HTTP concerns.
 */
export const ErrorType = {
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION: 'VALIDATION',
    CONFLICT: 'CONFLICT',
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorTypeValue = (typeof ErrorType)[keyof typeof ErrorType];
