import { ApiError } from '@/utils/api-error'
import { NewParent, Parent } from '@/db'
import {
    ParentRepository,
    ParentQueryFilters
} from '@/repositories/parents-repository'
import { createPaginationMeta } from '@/utils/pagination'
import type { AuthenticatedUser } from '@/services/auth-service'

export class ParentService {
    constructor(private readonly parent_repository: ParentRepository) {}

    async createParent(
        parent_payload: NewParent,
        currentUser: AuthenticatedUser
    ): Promise<Parent> {
        const userId =
            currentUser.role === 'parent'
                ? currentUser.id
                : parent_payload.user_id

        if (currentUser.role !== 'parent') {
            const targetRole = userId
                ? await this.parent_repository.findUserRole(userId)
                : undefined
            if (targetRole !== 'parent') {
                throw ApiError.badRequest(
                    'A parent profile can only be created for a parent account'
                )
            }
        }

        const scopedPayload = { ...parent_payload, user_id: userId }
        const checks = await this.parent_repository.checkUniqueConstraints({
            user_id: scopedPayload.user_id || undefined,
            identity_number: scopedPayload.identity_number || undefined
        })

        if (checks.userExists) {
            throw ApiError.conflict('User already has a parent profile')
        }
        if (checks.identityExists) {
            throw ApiError.badRequest(
                'Identity number (NIK) is already registered'
            )
        }

        return this.parent_repository.create(scopedPayload)
    }

    async getParents(
        query_filters: ParentQueryFilters | undefined,
        currentUser: AuthenticatedUser
    ) {
        const { page = 1, limit = 10 } = query_filters || {}
        const filters = { ...query_filters }
        const isStaff =
            currentUser.role === 'cadre' || currentUser.role === 'midwife'
        if (isStaff) {
            filters.nameOnlySearch = true
            filters.includeDeleted = false
        }

        const { data, totalItems } =
            await this.parent_repository.getParents(filters)

        const visibleData = isStaff
            ? data.map(parent => ({
                  id: parent.id,
                  user_id: parent.user_id,
                  name: parent.name,
                  phone_number: parent.phone_number
              }))
            : data

        return {
            data: visibleData,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getParentById(public_id: string): Promise<Parent> {
        const parent = await this.parent_repository.findById(public_id)
        if (!parent) throw ApiError.notFound('Parent profile not found')
        return parent
    }

    async updateParent(
        public_id: string,
        parent_payload: Partial<NewParent>,
        currentUser: AuthenticatedUser
    ): Promise<Parent> {
        const existingParent = await this.getParentById(public_id)

        if (
            currentUser.role === 'parent' &&
            currentUser.parent_id !== existingParent.id
        ) {
            throw ApiError.forbidden('You can only update your own profile')
        }
        if (
            parent_payload.user_id !== undefined &&
            parent_payload.user_id !== existingParent.user_id
        ) {
            throw ApiError.forbidden(
                'Parent profile ownership cannot be changed through this endpoint'
            )
        }
        if (
            currentUser.role === 'parent' &&
            parent_payload.status !== undefined
        ) {
            throw ApiError.forbidden(
                'Parents cannot change profile status'
            )
        }

        const checks = await this.parent_repository.checkUniqueConstraints({
            user_id:
                parent_payload.user_id &&
                parent_payload.user_id !== existingParent.user_id
                    ? parent_payload.user_id
                    : undefined,
            identity_number:
                parent_payload.identity_number &&
                parent_payload.identity_number !==
                    existingParent.identity_number
                    ? parent_payload.identity_number
                    : undefined
        })

        if (checks.identityExists) {
            throw ApiError.badRequest(
                'Identity number (NIK) is already registered by another parent'
            )
        }
        if (checks.userExists) {
            throw ApiError.conflict(
                'The target user already has a parent profile'
            )
        }

        const updated = await this.parent_repository.update(
            public_id,
            parent_payload
        )
        if (!updated)
            throw ApiError.badRequest('Failed to update parent profile')
        return updated
    }

    async deleteParent(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Parent> {
        const existing = await this.parent_repository.findById(public_id, true)
        if (!existing) throw ApiError.notFound('Parent profile not found')

        if (!is_permanent && existing.status === 'inactive') {
            return existing
        }

        const deleted = is_permanent
            ? await this.parent_repository.hardDelete(public_id)
            : await this.parent_repository.softDelete(public_id)

        if (!deleted)
            throw ApiError.badRequest('Failed to delete parent profile')
        return deleted
    }

    async restoreParent(public_id: string): Promise<Parent> {
        const restored = await this.parent_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore parent profile')
        return restored
    }
}
