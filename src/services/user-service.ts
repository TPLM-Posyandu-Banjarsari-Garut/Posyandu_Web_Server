import { NewUser, User } from '@/db'
import {
    UserRepository,
    UserQueryFilters
} from '@/repositories/user-repository'

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

        return this.user_repository.create(user_payload)
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
        await this.getUserById(public_id)

        const updated = await this.user_repository.update(
            public_id,
            user_payload
        )
        if (!updated) throw new Error('Failed to update user')
        return updated
    }

    async deleteUser(public_id: string): Promise<User> {
        await this.getUserById(public_id)

        const deleted = await this.user_repository.delete(public_id)
        if (!deleted) throw new Error('Failed to delete user')
        return deleted
    }
}
