import { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
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
        const webHeaders = fromNodeHeaders(req.headers)
        const currentUser = await authService.verifyActiveSession(webHeaders)
        res.locals.user = currentUser
        next()
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unauthorized access'
        next(ApiError.unauthorized(errorMessage))
    }
}
