import { NewUser, User } from '@/db'
import {
    UserRepository,
    UserQueryFilters
} from '@/repositories/user-repository'

import { AuthService } from '@/services/auth-service'

export class UserService {
    constructor(private readonly user_repository: UserRepository) {}

    async createUser(user_payload: NewUser): Promise<User> {
        const [email_exists, phone_exists] = await Promise.all([
            this.user_repository.existsByEmail(user_payload.email),
            user_payload.phone_number
                ? this.user_repository.existsByPhoneNumber(
                      user_payload.phone_number
                  )
                : false
        ])

        if (email_exists) throw new Error('Email already registered')
        if (phone_exists) throw new Error('Phone number already registered')

        const auth_service = new AuthService(this.user_repository)
        return await auth_service.registerWithEmail({
            email: user_payload.email,
            password: user_payload.password,
            name: user_payload.name,
            phone_number: user_payload.phone_number,
            avatar_url: (user_payload as Record<string, unknown>).avatar_url as
                | string
                | undefined,
            role: (user_payload.role || 'parent') as
                | 'admin'
                | 'midwife'
                | 'cadre'
                | 'parent'
        })
    }

    async getUsers(query_filters?: UserQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.user_repository.getUsers(query_filters)

        return {
            data,
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / limit)
            }
        }
    }

    async getUserById(public_id: string): Promise<User> {
        const user = await this.user_repository.findById(public_id)
        if (!user) throw new Error('User not found')
        return user
    }

    async updateUser(
        public_id: string,
        user_payload: Partial<NewUser>
    ): Promise<User> {
        const existing_user = await this.getUserById(public_id)

        const checks: Promise<boolean>[] = []
        const email = user_payload.email
        const phone = user_payload.phone_number

        const check_email = email && email !== existing_user.email
        const check_phone = phone && phone !== existing_user.phone_number

        if (check_email && email) {
            checks.push(this.user_repository.existsByEmail(email))
        }
        if (check_phone && phone) {
            checks.push(this.user_repository.existsByPhoneNumber(phone))
        }

        if (checks.length > 0) {
            const results = await Promise.all(checks)
            let index = 0

            if (check_email && results[index++]) {
                throw new Error('Email already taken by another user')
            }
            if (check_phone && results[index]) {
                throw new Error('Phone number already taken by another user')
            }
        }

        const updated = await this.user_repository.update(
            public_id,
            user_payload
        )
        if (!updated) throw new Error('Failed to update user')
        return updated
    }

    async deleteUser(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<User> {
        await this.getUserById(public_id)

        const deleted = is_permanent
            ? await this.user_repository.hardDelete(public_id)
            : await this.user_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete user')
        return deleted
    }

    async restoreUser(public_id: string): Promise<User> {
        const restored = await this.user_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore user')
        return restored
    }
}
