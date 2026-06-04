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
            schema.parse(req[target])

            next()
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
