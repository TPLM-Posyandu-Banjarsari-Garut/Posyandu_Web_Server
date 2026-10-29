import { ApiError, ErrorCode } from '../api-error'
import { STATUS_CODES } from '@/constants/status-codes'

describe('ApiError', () => {
    it.each([
        ['badRequest', STATUS_CODES.BAD_REQUEST, ErrorCode.VALIDATION_ERROR],
        ['unauthorized', STATUS_CODES.UNAUTHORIZED, ErrorCode.UNAUTHORIZED],
        ['forbidden', STATUS_CODES.FORBIDDEN, ErrorCode.FORBIDDEN],
        ['notFound', STATUS_CODES.NOT_FOUND, ErrorCode.NOT_FOUND],
        ['conflict', STATUS_CODES.CONFLICT, ErrorCode.CONFLICT],
        ['validation', STATUS_CODES.BAD_REQUEST, ErrorCode.VALIDATION_ERROR],
        [
            'notImplemented',
            STATUS_CODES.NOT_IMPLEMENTED,
            ErrorCode.INTERNAL_ERROR
        ],
        ['badGateway', STATUS_CODES.BAD_GATEWAY, ErrorCode.SERVICE_UNAVAILABLE],
        [
            'serviceUnavailable',
            STATUS_CODES.SERVICE_UNAVAILABLE,
            ErrorCode.SERVICE_UNAVAILABLE
        ],
        [
            'tooManyRequests',
            STATUS_CODES.TOO_MANY_REQUESTS,
            ErrorCode.TOO_MANY_REQUESTS
        ],
        [
            'server',
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            ErrorCode.INTERNAL_ERROR
        ],
        [
            'internal',
            STATUS_CODES.INTERNAL_SERVER_ERROR,
            ErrorCode.INTERNAL_ERROR
        ]
    ])('%s creates a typed operational error', (factory, status, code) => {
        const error = ApiError[factory as keyof typeof ApiError]() as ApiError

        expect(error).toBeInstanceOf(Error)
        expect(error.name).toBe('ApiError')
        expect(error.statusCode).toBe(status)
        expect(error.code).toBe(code)
    })

    it('preserves custom messages, codes, and validation details', () => {
        const details = [{ field: 'email', message: 'invalid' }]
        const error = ApiError.badRequest(
            'Invalid request',
            details,
            ErrorCode.CONFLICT
        )

        expect(error.message).toBe('Invalid request')
        expect(error.errors).toBe(details)
        expect(error.code).toBe(ErrorCode.CONFLICT)
        expect(error.isOperational).toBe(true)
        expect(ApiError.server().isOperational).toBe(false)
    })
})
