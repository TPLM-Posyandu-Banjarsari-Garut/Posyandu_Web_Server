import { auth } from '@/configs/auth'
import db from '@/configs/db'
import { logger } from '@/utils/logger'
import { User, users, accounts, parents, cadres, midwifes } from '@/db'
import { UserRepository } from '@/repositories/user-repository'
import {
    AuthenticateCredentialsPayload,
    AuthenticationResult,
    RegisterMultiRolePayload
} from '@/types/auth-types'
import { eq } from 'drizzle-orm'
import { ApiError } from '@/utils/api-error'

export interface AuthenticatedUser extends User {
    parent_id?: string | null
    midwife_id?: string | null
    cadre_id?: string | null
    posyandu_id?: string | null
}

export class AuthService {
    constructor(private readonly user_repository: UserRepository) {}

    async registerWithEmail(
        user_payload: RegisterMultiRolePayload
    ): Promise<User> {
        const { email, password, name, phone_number, avatar_url, role } =
            user_payload

        const account_creation = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                image: avatar_url || undefined,
                role: role || 'parent',
                status: 'active'
            }
        })

        if (!account_creation?.user) {
            throw ApiError.badRequest(
                'Failed to register user credentials with authentication service'
            )
        }

        const generated_public_id = account_creation.user.id

        try {
            if (phone_number) {
                await this.user_repository.updateWithTransaction(
                    db,
                    generated_public_id,
                    { phone_number }
                )
            }

            await db.transaction(async tx => {
                if (role === 'parent') {
                    await tx.insert(parents).values({
                        user_id: generated_public_id,
                        ...user_payload.parent_data
                    })
                } else if (role === 'cadre') {
                    if (!user_payload.cadre_data?.posyandu_id) {
                        throw ApiError.badRequest(
                            'posyandu_id is required for cadre role'
                        )
                    }
                    const { posyandu_id, ...restCadreData } =
                        user_payload.cadre_data
                    await tx.insert(cadres).values({
                        ...restCadreData,
                        user_id: generated_public_id,
                        posyandu_id
                    })
                } else if (role === 'midwife') {
                    if (
                        !user_payload.midwife_data?.posyandu_id ||
                        !user_payload.midwife_data?.identity_number
                    ) {
                        throw ApiError.badRequest(
                            'posyandu_id and identity_number are required for midwife role'
                        )
                    }
                    const { posyandu_id, identity_number, ...restMidwifeData } =
                        user_payload.midwife_data
                    await tx.insert(midwifes).values({
                        ...restMidwifeData,
                        user_id: generated_public_id,
                        posyandu_id,
                        identity_number: identity_number!
                    })
                }
            })
        } catch (error) {
            logger.error(
                error,
                'Error during multi-role user registration transaction'
            )
            await db.delete(users).where(eq(users.id, generated_public_id))
            await db
                .delete(accounts)
                .where(eq(accounts.user_id, generated_public_id))
            if (error instanceof ApiError) {
                throw error
            }
            throw ApiError.internal()
        }

        const complete_profile =
            await this.user_repository.findByPublicId(generated_public_id)
        if (!complete_profile) {
            throw ApiError.notFound(
                'User profile failed to synchronize after registration transaction'
            )
        }

        return complete_profile
    }

    async loginWithEmail(
        login_payload: AuthenticateCredentialsPayload,
        request_headers: Headers
    ): Promise<AuthenticationResult> {
        const { email, password } = login_payload

        const auth_result = await auth.api.signInEmail({
            body: { email, password },
            headers: request_headers
        })

        if (!auth_result?.user || !auth_result?.token) {
            throw ApiError.unauthorized('Invalid email address or password')
        }

        const session_expiry = new Date(Date.now() + 8 * 60 * 60 * 1000)

        return {
            session_token: auth_result.token,
            session_expiry,
            user_profile: auth_result.user
        }
    }

    async verifyActiveSession(
        request_headers: Headers
    ): Promise<AuthenticatedUser> {
        const active_session = await auth.api.getSession({
            headers: request_headers
        })

        if (!active_session?.user) {
            throw ApiError.unauthorized(
                'Unauthorized access: session is invalid or has expired'
            )
        }

        const current_user = await this.user_repository.findByIdWithProfile(
            active_session.user.id
        )
        if (!current_user || current_user.status !== 'active') {
            throw ApiError.unauthorized(
                'Unauthorized access: account is inactive or has been deleted'
            )
        }

        return current_user
    }

    async logout(request_headers: Headers): Promise<void> {
        await auth.api.signOut({ headers: request_headers })
    }
}
