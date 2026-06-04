import { Request, Response, NextFunction } from 'express'
import z, { ZodError, type ZodType } from 'zod'

import { ApiError } from '@/utils/api-error'

type ValidateTarget = 'body' | 'query' | 'params'

export const validateRequest = (
    schema: ZodType,
    target: ValidateTarget = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedData = schema.parse(req[target])

            // SOLUSI: Jika target adalah body, aman untuk langsung ditimpa
            if (target === 'body') {
                req.body = parsedData
            }
        } catch (error) {
            if (!(error instanceof ZodError)) {
                return next(error)
            }

            throw ApiError.badRequest(
                'Invalid request data',
                z.flattenError(error).fieldErrors
            )
        }
    }
}
