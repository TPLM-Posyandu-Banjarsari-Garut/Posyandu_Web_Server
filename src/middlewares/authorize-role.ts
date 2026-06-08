import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/api-error'

export type Role = 'admin' | 'midwife' | 'cadre' | 'parent'

export const authorizeRoles = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user

        if (!user) {
            return next(
                ApiError.unauthorized('Unauthorized. Please login first.')
            )
        }

        if (!user.role || !allowedRoles.includes(user.role as Role)) {
            return next(
                ApiError.forbidden(
                    'Forbidden. You do not have permission to access this resource.'
                )
            )
        }

        next()
    }
}
