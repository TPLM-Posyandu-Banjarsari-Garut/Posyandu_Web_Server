import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewChildren, Children } from '@/db'
import {
    ChildrenRepository,
    ChildrenQueryFilters
} from '@/repositories/childrens-repository'
import { ParentRepository } from '@/repositories/parents-repository'

export class ChildrenService {
    constructor(
        private readonly children_repository: ChildrenRepository,
        private readonly parent_repository?: ParentRepository
    ) {}

    async createChildren(
        children_payload: NewChildren & { parent_user_id?: string | null }
    ): Promise<Children> {
        const checks = await this.children_repository.checkUniqueConstraints({
            identity_number: children_payload.identity_number || undefined
        })
        if (checks.identityExists) {
            throw ApiError.badRequest(
                'Identity number (NIK) is already registered'
            )
        }

        const { parent_user_id, ...childData } = children_payload
        const child = await this.children_repository.create(childData)

        if (parent_user_id && this.parent_repository) {
            let parent =
                await this.parent_repository.findByUserId(parent_user_id)
            parent ??= await this.parent_repository.create({
                user_id: parent_user_id,
                rt: null,
                rw: null
            })
            if (parent) {
                await this.children_repository.linkParent(child.id, parent.id)
            }
        }

        return child
    }

    async getChildrens(query_filters?: ChildrenQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.children_repository.getChildrens(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getChildrenById(
        public_id: string
    ): Promise<
        Exclude<Awaited<ReturnType<ChildrenRepository['findById']>>, undefined>
    > {
        const child = await this.children_repository.findById(public_id)
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
        }
    ): Promise<Children> {
        const existingChild = await this.getChildrenById(public_id)

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
                let parent =
                    await this.parent_repository.findByUserId(parent_user_id)
                parent ??= await this.parent_repository.create({
                    user_id: parent_user_id,
                    rt: null,
                    rw: null
                })
                if (parent) {
                    await this.children_repository.linkParent(
                        updated.id,
                        parent.id
                    )
                }
            }
        }

        return updated
    }

    async deleteChildren(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Children> {
        const existing = await this.children_repository.findById(
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

    async restoreChildren(public_id: string): Promise<Children> {
        const restored = await this.children_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore children data')
        return restored
    }

    async verifyParentAccess(
        public_id: string,
        parent_id: string
    ): Promise<boolean> {
        const parentChildren =
            await this.children_repository.findByParentId(parent_id)

        const hasAccess = parentChildren.some(child => child.id === public_id)

        if (!hasAccess) {
            throw ApiError.badRequest(
                'Unauthorized access: This children record does not belong to the user'
            )
        }
        return true
    }
}
