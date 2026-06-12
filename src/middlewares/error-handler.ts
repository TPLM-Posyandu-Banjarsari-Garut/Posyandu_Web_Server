import { Request, Response, NextFunction } from 'express'
import env from '@/configs/env'
import { ApiError } from '@/utils/api-error'
import { logger } from '@/utils/logger'

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (res.headersSent) {
        return next(err)
    }

    let statusCode = 500
    let message = 'Internal server error'
    let errors: unknown

    if (err instanceof ApiError) {
        statusCode = err.statusCode
        message = err.message
        errors = err.errors
    } else if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>
        if ('status' in errorObj && typeof errorObj.status === 'number') {
            statusCode = errorObj.status
            message =
                typeof errorObj.message === 'string'
                    ? errorObj.message
                    : message
        } else if (
            'statusCode' in errorObj &&
            typeof errorObj.statusCode === 'number'
        ) {
            statusCode = errorObj.statusCode
            message =
                typeof errorObj.message === 'string'
                    ? errorObj.message
                    : message
        }
    }

    logger.error(
        err,
        `Error: ${message} | Status: ${statusCode} | Path: ${req.method} ${req.originalUrl}`
    )

    res.status(statusCode).json({
        success: false,
        message,
        statusCode,
        ...(errors !== undefined && { errors }),
        ...(env.NODE_ENV === 'development' &&
            err instanceof Error && { stack: err.stack })
    })
}
