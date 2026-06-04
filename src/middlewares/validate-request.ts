import { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodType, z } from 'zod'
import { ApiError } from '@/utils/api-error'

type ValidationSchemas = {
    body?: ZodType
    query?: ZodType
    params?: ZodType
}

export const validateRequest = (schemas: ValidationSchemas) => {
    const combinedSchema = z.object({
        ...(schemas.body && { body: schemas.body }),
        ...(schemas.query && { query: schemas.query }),
        ...(schemas.params && { params: schemas.params })
    })

    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const parsed = await combinedSchema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            })

            if (schemas.body) req.body = parsed.body
            if (schemas.query) req.query = parsed.query as typeof req.query
            if (schemas.params) req.params = parsed.params as typeof req.params

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return next(
                    ApiError.validation('Invalid request data', z.flattenError)
                )
            }
            next(error)
        }
    }
}
