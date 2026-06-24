import { STATUS_CODES, StatusCode } from '@/constants/status-codes'

export enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export class ApiError extends Error {
    static internal(
        message = 'Internal Server Error',
        code = ErrorCode.INTERNAL_ERROR
    ) {
        return ApiError.server(message, false, undefined, code)
    }
    public readonly statusCode: StatusCode
    public readonly isOperational: boolean
    public readonly errors?: unknown
    public readonly code: ErrorCode

    constructor(
        statusCode: StatusCode,
        message: string,
        errors?: unknown,
        isOperational = true,
        code: ErrorCode = ErrorCode.INTERNAL_ERROR
    ) {
        super(message)
        this.name = 'ApiError'
        this.statusCode = statusCode
        this.errors = errors
        this.isOperational = isOperational
        this.code = code

        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(
        message = 'Bad Request',
        errors?: unknown,
        code = ErrorCode.VALIDATION_ERROR
    ) {
        return new ApiError(
            STATUS_CODES.BAD_REQUEST,
            message,
            errors,
            true,
            code
        )
    }

    static unauthorized(
        message = 'Unauthorized',
        code = ErrorCode.UNAUTHORIZED
    ) {
        return new ApiError(
            STATUS_CODES.UNAUTHORIZED,
            message,
            undefined,
            true,
            code
        )
    }

    static forbidden(message = 'Forbidden', code = ErrorCode.FORBIDDEN) {
        return new ApiError(
            STATUS_CODES.FORBIDDEN,
            message,
            undefined,
            true,
            code
        )
    }

    static notFound(message = 'Not Found', code = ErrorCode.NOT_FOUND) {
        return new ApiError(
            STATUS_CODES.NOT_FOUND,
            message,
            undefined,
            true,
            code
        )
    }

    static conflict(message = 'Conflict', code = ErrorCode.CONFLICT) {
        return new ApiError(
            STATUS_CODES.CONFLICT,
            message,
            undefined,
            true,
            code
        )
    }

    static validation(
        message = 'Validation failed',
        errors?: unknown,
        code = ErrorCode.VALIDATION_ERROR
    ) {
        return new ApiError(
            STATUS_CODES.BAD_REQUEST,
            message,
            errors,
            true,
            code
        )
    }

    static notImplemented(
        message = 'Not Implemented',
        code = ErrorCode.INTERNAL_ERROR
    ) {
        return new ApiError(
            STATUS_CODES.NOT_IMPLEMENTED,
            message,
            undefined,
            true,
            code
        )
    }

    static badGateway(
        message = 'Bad Gateway',
        code = ErrorCode.SERVICE_UNAVAILABLE
    ) {
        return new ApiError(
            STATUS_CODES.BAD_GATEWAY,
            message,
            undefined,
            true,
            code
        )
    }

    static serviceUnavailable(
        message = 'Service Unavailable',
        code = ErrorCode.SERVICE_UNAVAILABLE
    ) {
        return new ApiError(
            STATUS_CODES.SERVICE_UNAVAILABLE,
            message,
            undefined,
            true,
            code
        )
    }

    static tooManyRequests(
        message = 'Too Many Requests',
        code = ErrorCode.TOO_MANY_REQUESTS
    ) {
        return new ApiError(
            STATUS_CODES.TOO_MANY_REQUESTS,
            message,
            undefined,
            true,
            code
        )
    }

    static server(
        message = 'Internal Server Error',
        isOperational = false,
        errors?: unknown,
        code = ErrorCode.INTERNAL_ERROR
    ) {
        return new ApiError(
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            message,
            errors,
            isOperational,
            code
        )
    }
}
