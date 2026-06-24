import { NewUser, User } from '@/db'
import { CreateUserInput } from '@/validations/users-validation'
import {
    UserRepository,
    UserQueryFilters
} from '@/repositories/user-repository'

import { AuthService } from '@/services/auth-service'
import { createPaginationMeta } from '@/utils/pagination'
import { ApiError } from '@/utils/api-error'
import { RegisterMultiRolePayload } from '@/types/auth-types'
import { AuthorizationService } from '@/services/authorization-service'

export class UserService {
    constructor(
        private readonly user_repository: UserRepository,
        private readonly authorization_service: AuthorizationService = new AuthorizationService()
    ) {}

    async createUser(user_payload: CreateUserInput): Promise<User> {
        const checks = await this.user_repository.checkUniqueConstraints({
            email: user_payload.email,
            phone_number: user_payload.phone_number
        })

        if (checks.emailExists)
            throw ApiError.badRequest('Email already registered')
        if (checks.phoneExists)
            throw ApiError.badRequest('Phone number already registered')

        const auth_service = new AuthService(this.user_repository)
        return await auth_service.registerWithEmail({
            email: user_payload.email,
            password: user_payload.password,
            name: user_payload.name,
            phone_number: user_payload.phone_number,
            avatar_url: user_payload.avatar_url,
            role: user_payload.role,
            parent_data: user_payload.parent_data
                ? (user_payload.parent_data as RegisterMultiRolePayload['parent_data'])
                : undefined,
            cadre_data: user_payload.cadre_data
                ? (user_payload.cadre_data as RegisterMultiRolePayload['cadre_data'])
                : undefined,
            midwife_data: user_payload.midwife_data
                ? (user_payload.midwife_data as RegisterMultiRolePayload['midwife_data'])
                : undefined
        })
    }

    async getUsers(query_filters?: UserQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.user_repository.getUsers(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getUserById(public_id: string, currentUser?: User): Promise<User> {
        if (currentUser) {
            if (
                !this.authorization_service.canAccessUser(
                    currentUser,
                    public_id
                )
            ) {
                throw ApiError.forbidden(
                    'You do not have permission to access this user'
                )
            }
        }
        const user = await this.user_repository.findById(public_id)
        if (!user) throw ApiError.notFound('User not found')
        return user
    }

    async updateUser(
        public_id: string,
        user_payload: Partial<NewUser>,
        currentUser?: User
    ): Promise<User> {
        if (currentUser) {
            if (
                !this.authorization_service.canAccessUser(
                    currentUser,
                    public_id
                )
            ) {
                throw ApiError.forbidden(
                    'You do not have permission to update this user'
                )
            }
            if (user_payload.role && currentUser.role !== 'admin') {
                throw ApiError.forbidden('Only admin can change user roles')
            }
        }
        const existing_user = await this.user_repository.findById(public_id)
        if (!existing_user) throw ApiError.notFound('User not found')

        const checks = await this.user_repository.checkUniqueConstraints({
            email:
                user_payload.email && user_payload.email !== existing_user.email
                    ? user_payload.email
                    : undefined,
            phone_number:
                user_payload.phone_number &&
                user_payload.phone_number !== existing_user.phone_number
                    ? user_payload.phone_number
                    : undefined
        })

        if (checks.emailExists) {
            throw ApiError.conflict('Email already taken by another user')
        }
        if (checks.phoneExists) {
            throw ApiError.conflict(
                'Phone number already taken by another user'
            )
        }

        const updated = await this.user_repository.update(
            public_id,
            user_payload
        )
        if (!updated) throw ApiError.badRequest('Failed to update user')
        return updated
    }

    async deleteUser(
        public_id: string,
        is_permanent: boolean = false,
        currentUser?: User
    ): Promise<User> {
        if (currentUser) {
            if (
                !this.authorization_service.canAccessUser(
                    currentUser,
                    public_id
                )
            ) {
                throw ApiError.forbidden(
                    'You do not have permission to delete this user'
                )
            }
        }
        const existing_user =
            await this.user_repository.findByPublicId(public_id)
        if (!existing_user) throw ApiError.notFound('User not found')

        if (!is_permanent && existing_user.status === 'inactive') {
            return existing_user
        }

        const deleted = is_permanent
            ? await this.user_repository.hardDelete(public_id)
            : await this.user_repository.softDelete(public_id)

        if (!deleted) throw ApiError.badRequest('Failed to delete user')
        return deleted
    }

    async restoreUser(public_id: string, currentUser?: User): Promise<User> {
        if (currentUser) {
            if (
                !this.authorization_service.canAccessUser(
                    currentUser,
                    public_id
                )
            ) {
                throw ApiError.forbidden(
                    'You do not have permission to restore this user'
                )
            }
        }
        const restored = await this.user_repository.restore(public_id)
        if (!restored) throw ApiError.badRequest('Failed to restore user')
        return restored
    }
}
