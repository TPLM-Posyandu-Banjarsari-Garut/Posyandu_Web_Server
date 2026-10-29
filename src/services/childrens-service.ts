import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewChildren, Children, Parent } from '@/db'
import {
    ChildrenRepository,
    ChildrenQueryFilters,
    NewbornReportFilters
} from '@/repositories/childrens-repository'
import { ParentRepository } from '@/repositories/parents-repository'
import { AuthorizationService } from '@/services/authorization-service'
import type { AuthenticatedUser } from '@/services/auth-service'

export class ChildrenService {
    constructor(
        private readonly children_repository: ChildrenRepository,
        private readonly parent_repository?: ParentRepository,
        private readonly authorization_service: AuthorizationService = new AuthorizationService()
    ) {}

    async createChildren(
        children_payload: NewChildren & { parent_user_id?: string | null },
        currentUser: AuthenticatedUser
    ): Promise<Children> {
        const parent_user_id =
            currentUser.role === 'parent'
                ? currentUser.id
                : children_payload.parent_user_id

        let parent: Parent | undefined
        if (parent_user_id) {
            if (!this.parent_repository) {
                throw ApiError.internal()
            }
            parent = await this.parent_repository.findByUserId(parent_user_id)
            if (!parent) {
                throw ApiError.badRequest('Parent profile not found')
            }
        }

        const checks = await this.children_repository.checkUniqueConstraints({
            identity_number: children_payload.identity_number || undefined
        })
        if (checks.identityExists) {
            throw ApiError.badRequest(
                'Identity number (NIK) is already registered'
            )
        }

        const { parent_user_id: _requestedParentUserId, ...childData } =
            children_payload
        const child = await this.children_repository.create(childData)

        if (parent) {
            await this.children_repository.linkParent(child.id, parent.id)
        }

        return child
    }

    async getChildrens(
        query_filters: ChildrenQueryFilters | undefined,
        currentUser: AuthenticatedUser
    ) {
        const filters = { ...query_filters }

        if (currentUser.role === 'parent') {
            filters.parent_id = currentUser.parent_id ?? ''
            filters.includeDeleted = false
        } else if (
            currentUser.role === 'cadre' ||
            currentUser.role === 'midwife'
        ) {
            if (currentUser.posyandu_id) {
                filters.posyandu_id = currentUser.posyandu_id
            }
            filters.includeDeleted = false
        }

        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.children_repository.getChildrens(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getNewbornReport(
        filters: NewbornReportFilters,
        currentUser: AuthenticatedUser
    ) {
        const scopedFilters = { ...filters }
        if (
            (currentUser.role === 'cadre' || currentUser.role === 'midwife') &&
            currentUser.posyandu_id
        ) {
            scopedFilters.posyandu_id = currentUser.posyandu_id
        }

        const { page = 1, limit = 10 } = filters
        const { summary, data, totalItems } =
            await this.children_repository.getNewbornReport(scopedFilters)

        return {
            summary,
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getChildrenById(
        public_id: string,
        currentUser: AuthenticatedUser
    ): Promise<
        Exclude<
            Awaited<ReturnType<ChildrenRepository['findByIdWithEnrichment']>>,
            undefined
        >
    > {
        const canAccess = await this.authorization_service.canAccessChild(
            currentUser,
            public_id
        )
        if (!canAccess) {
            throw ApiError.forbidden(
                'You do not have permission to access this child record'
            )
        }
        const child =
            await this.children_repository.findByIdWithEnrichment(public_id)
        if (!child) throw ApiError.notFound('Children not found')
        return child
    }

    async getChildrenByParent(parent_id: string): Promise<Children[]> {
        return this.children_repository.findByParentId(parent_id)
    }

    async updateChildren(
        public_id: string,
        children_payload: Partial<NewChildren> & {
            parent_user_id?: string | null
        },
        currentUser: AuthenticatedUser
    ): Promise<Children> {
        const canAccess = await this.authorization_service.canAccessChild(
            currentUser,
            public_id
        )
        if (!canAccess) {
            throw ApiError.forbidden(
                'You do not have permission to update this child record'
            )
        }

        if (
            currentUser.role === 'parent' &&
            (children_payload.parent_user_id !== undefined ||
                children_payload.posyandu_id !== undefined)
        ) {
            throw ApiError.forbidden(
                'Parents cannot change child ownership or Posyandu assignment'
            )
        }

        const existingChild = await this.getChildrenById(public_id, currentUser)

        let linkedParent: Parent | undefined
        if (children_payload.parent_user_id) {
            if (!this.parent_repository) {
                throw ApiError.internal()
            }
            linkedParent = await this.parent_repository.findByUserId(
                children_payload.parent_user_id
            )
            if (!linkedParent) {
                throw ApiError.badRequest('Parent profile not found')
            }
        }

        const checks = await this.children_repository.checkUniqueConstraints({
            identity_number:
                children_payload.identity_number &&
                children_payload.identity_number !==
                    existingChild.identity_number
                    ? children_payload.identity_number
                    : undefined
        })

        if (checks.identityExists) {
            throw ApiError.badRequest(
                'Identity number (NIK) is already registered by another child'
            )
        }

        const { parent_user_id, ...childData } = children_payload
        const updated = await this.children_repository.update(
            public_id,
            childData
        )
        if (!updated)
            throw ApiError.badRequest('Failed to update children data')

        if (parent_user_id !== undefined && this.parent_repository) {
            if (parent_user_id === null || parent_user_id === '') {
                await this.children_repository.unlinkParent(public_id)
            } else {
                await this.children_repository.linkParent(
                    updated.id,
                    linkedParent!.id
                )
            }
        }

        return updated
    }

    async deleteChildren(
        public_id: string,
        is_permanent: boolean,
        currentUser: AuthenticatedUser
    ): Promise<Children> {
        const canAccess = await this.authorization_service.canAccessChild(
            currentUser,
            public_id
        )
        if (!canAccess) {
            throw ApiError.forbidden(
                'You do not have permission to delete this child record'
            )
        }

        const existing = await this.children_repository.findByIdWithEnrichment(
            public_id,
            true
        )
        if (!existing) throw ApiError.notFound('Children not found')

        if (!is_permanent && existing.deleted_at !== null) {
            return existing
        }

        const deleted = is_permanent
            ? await this.children_repository.hardDelete(public_id)
            : await this.children_repository.softDelete(public_id)

        if (!deleted)
            throw ApiError.badRequest('Failed to delete children data')
        return deleted
    }

    async restoreChildren(
        public_id: string,
        currentUser: AuthenticatedUser
    ): Promise<Children> {
        const canAccess = await this.authorization_service.canAccessChild(
            currentUser,
            public_id
        )
        if (!canAccess) {
            throw ApiError.forbidden(
                'You do not have permission to restore this child record'
            )
        }
        const restored = await this.children_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore children data')
        return restored
    }
}
