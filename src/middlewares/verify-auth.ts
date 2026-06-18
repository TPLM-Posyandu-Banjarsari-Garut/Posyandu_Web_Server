import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/services/auth-service'
import { UserRepository } from '@/repositories/user-repository'
import db from '@/configs/db'
import { ApiError } from '@/utils/api-error'
import { fromNodeHeaders } from 'better-auth/node'
import { accounts } from '@/db'
import { and, eq, ne } from 'drizzle-orm'

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

        if (currentUser.status === 'inactive') {
            throw ApiError.forbidden(
                'Your account has been deactivated. Please contact support.'
            )
        }

        if (!currentUser.email_verified) {
            const [socialAccount] = await db
                .select({ id: accounts.id })
                .from(accounts)
                .where(
                    and(
                        eq(accounts.user_id, currentUser.id),
                        ne(accounts.provider_id, 'credential')
                    )
                )
                .limit(1)

            if (!socialAccount) {
                throw ApiError.forbidden(
                    'Email address must be verified before accessing this resource'
                )
            }
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
