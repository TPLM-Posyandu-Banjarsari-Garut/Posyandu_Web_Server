import { STATUS_CODES, StatusCode } from '@/constants/status-codes'
import type { Response } from 'express'

export type PaginationMeta = {
    page: number
    limit: number
    totalItems: number
    totalPages: number
}

export class ApiResponse {
    private static send<T>(
        res: Response,
        statusCode: StatusCode,
        success: boolean,
        message: string,
        data?: T,
        meta?: unknown,
        errors?: unknown
    ): Response {
        return res.status(statusCode).json({
            success,
            message,
            statusCode,
            ...(data !== undefined && { data }),
            ...(meta !== undefined && { meta }),
            ...(errors !== undefined && { errors })
        })
    }

    static ok<T>(res: Response, message = 'OK', data?: T): Response {
        return this.send(res, STATUS_CODES.OK, true, message, data)
    }

    static created<T>(res: Response, message = 'Created', data?: T): Response {
        return this.send(res, STATUS_CODES.CREATED, true, message, data)
    }

    static paginated<T>(
        res: Response,
        data: T,
        meta: PaginationMeta,
        message = 'OK'
    ): Response {
        return this.send(res, STATUS_CODES.OK, true, message, data, meta)
    }

    static error(
        res: Response,
        message = 'Internal Server Error',
        statusCode: StatusCode = STATUS_CODES.INTERNAL_SERVER_ERROR,
        errors?: unknown
    ): Response {
        return this.send(
            res,
            statusCode,
            false,
            message,
            undefined,
            undefined,
            errors
        )
    }
}
