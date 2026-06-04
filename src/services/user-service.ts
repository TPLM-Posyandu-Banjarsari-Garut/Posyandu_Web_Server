import { User } from '@/db'
import {
    UserRepository,
    UserQueryFilters
} from '@/repositories/user-repository'
import {
    createUserSchema,
    updateUserSchema,
    CreateUserInput,
    UpdateUserInput
} from '@/validations/user-validation'

export class UserService {
    constructor(private readonly user_repository: UserRepository) {}

    async createUser(user_payload: CreateUserInput): Promise<User> {
        const validated = createUserSchema.parse(user_payload)

        const [email_exists, phone_exists] = await Promise.all([
            this.user_repository.existsByEmail(validated.email),
            validated.phone_number
                ? this.user_repository.existsByPhoneNumber(
                      validated.phone_number
                  )
                : false
        ])

        if (email_exists) throw new Error('Email already registered')
        if (phone_exists) throw new Error('Phone number already registered')

        return this.user_repository.create(validated)
    }

    async getUsers(query_filters?: UserQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.user_repository.findManyPaginated(query_filters)

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
        user_payload: UpdateUserInput
    ): Promise<User> {
        await this.getUserById(public_id)

        const validated = updateUserSchema.parse(user_payload)

        const updated = await this.user_repository.update(public_id, validated)
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
