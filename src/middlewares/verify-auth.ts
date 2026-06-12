import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/services/auth-service'
import { UserRepository } from '@/repositories/user-repository'
import db from '@/configs/db'
import { ApiError } from '@/utils/api-error'

const userRepository = new UserRepository(db)
const authService = new AuthService(userRepository)

export const verifyAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader?.startsWith('Bearer ')) {
            throw new Error('Unauthorized access: Bearer token is required')
        }

        const webHeaders = new Headers()
        webHeaders.set('authorization', authHeader)
        const currentUser = await authService.verifyActiveSession(webHeaders)

        if (!currentUser.email_verified) {
            throw ApiError.forbidden('Email address must be verified')
        }

        res.locals.user = currentUser
        next()
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return next(error)
        }
        const errorMessage =
            error instanceof Error ? error.message : 'Unauthorized access'
        next(ApiError.unauthorized(errorMessage))
    }
}
