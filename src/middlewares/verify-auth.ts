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
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Unauthorized access: Bearer token is required')
        }

        const webHeaders = new Headers()
        webHeaders.set('authorization', authHeader)
        const currentUser = await authService.verifyActiveSession(webHeaders)
        res.locals.user = currentUser
        next()
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unauthorized access'
        next(ApiError.unauthorized(errorMessage))
    }
}
