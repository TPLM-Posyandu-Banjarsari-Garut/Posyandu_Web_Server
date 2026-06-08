import { NewChildren, Children } from '@/db'
import {
    ChildrenRepository,
    ChildrenQueryFilters
} from '@/repositories/childrens-repository'

export class ChildrenService {
    constructor(private readonly children_repository: ChildrenRepository) {}

    async createChildren(children_payload: NewChildren): Promise<Children> {
        const isIdentityNumberUsed =
            await this.children_repository.existsByIdentityNumber(
                children_payload.identity_number
            )
        if (isIdentityNumberUsed) {
            throw new Error('Identity number (NIK) is already registered')
        }

        return this.children_repository.create(children_payload)
    }

    async getChildrens(query_filters?: ChildrenQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.children_repository.getChildrens(query_filters)

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

    async getChildrenById(public_id: string): Promise<Children> {
        const child = await this.children_repository.findById(public_id)
        if (!child) throw new Error('Children not found')
        return child
    }

    async getChildrenByParent(parent_id: string): Promise<Children[]> {
        return this.children_repository.findByParentId(parent_id)
    }

    async updateChildren(
        public_id: string,
        children_payload: Partial<NewChildren>
    ): Promise<Children> {
        const existingChild = await this.getChildrenById(public_id)

        if (
            children_payload.identity_number &&
            children_payload.identity_number !== existingChild.identity_number
        ) {
            const isIdentityNumberUsed =
                await this.children_repository.existsByIdentityNumber(
                    children_payload.identity_number
                )
            if (isIdentityNumberUsed) {
                throw new Error(
                    'Identity number (NIK) is already registered by another child'
                )
            }
        }

        const updated = await this.children_repository.update(
            public_id,
            children_payload
        )
        if (!updated) throw new Error('Failed to update children data')
        return updated
    }

    async deleteChildren(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Children> {
        await this.getChildrenById(public_id)

        const deleted = is_permanent
            ? await this.children_repository.hardDelete(public_id)
            : await this.children_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete children data')
        return deleted
    }

    async restoreChildren(public_id: string): Promise<Children> {
        const restored = await this.children_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore children data')
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
            throw new Error(
                'Unauthorized access: This children record does not belong to the user'
            )
        }
        return true
    }
}
