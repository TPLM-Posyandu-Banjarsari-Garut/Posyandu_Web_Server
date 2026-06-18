import { NextFunction, Request, Response } from 'express'
import { ApiError } from '@/utils/api-error'

export type Role =
    | 'admin'
    | 'posyandu_admin'
    | 'village_admin'
    | 'midwife'
    | 'cadre'
    | 'parent'

export const authorizeRoles = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = res.locals.user

        if (!user) {
            return next(
                ApiError.unauthorized('Unauthorized. Please login first.')
            )
        }

        const userRole = user.role as Role
        const hasPermission = allowedRoles.some(role => {
            if (role === 'admin') {
                return (
                    userRole === 'admin' ||
                    userRole === 'posyandu_admin' ||
                    userRole === 'village_admin'
                )
            }
            return role === userRole
        })

        if (!userRole || !hasPermission) {
            return next(
                ApiError.forbidden(
                    'Forbidden. You do not have permission to access this resource.'
                )
            )
        }

        next()
    }
}
