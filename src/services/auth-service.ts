import { auth } from '@/configs/auth'
import db from '@/configs/db'
import { User } from '@/db'
import { UserRepository } from '@/repositories/user-repository'
import {
    AuthenticateCredentialsPayload,
    AuthenticationResult,
    RegisterMultiRolePayload
} from '@/types/auth-types'

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
                role,
                status: 'active'
            }
        })

        if (!account_creation?.user) {
            throw new Error(
                'Failed to register user credentials with authentication service'
            )
        }

        const generated_public_id = account_creation.user.id

        if (phone_number) {
            await this.user_repository.updateWithTransaction(
                db,
                generated_public_id,
                { phone_number }
            )
        }

        const complete_profile =
            await this.user_repository.findByPublicId(generated_public_id)
        if (!complete_profile) {
            throw new Error(
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
            throw new Error('Invalid email address or password')
        }

        const default_expiry = new Date()
        default_expiry.setDate(default_expiry.getDate() + 7)

        return {
            session_token: auth_result.token,
            session_expiry: default_expiry,
            user_profile: auth_result.user
        }
    }

    async verifyActiveSession(request_headers: Headers): Promise<User> {
        const active_session = await auth.api.getSession({
            headers: request_headers
        })

        if (!active_session?.user) {
            throw new Error(
                'Unauthorized access: session is invalid or has expired'
            )
        }

        const current_user = await this.user_repository.findByPublicId(
            active_session.user.id
        )
        if (!current_user) {
            throw new Error(
                'The database user profile linked to this session could not be found'
            )
        }

        return current_user
    }

    async logout(request_headers: Headers): Promise<void> {
        await auth.api.signOut({ headers: request_headers })
    }
}
