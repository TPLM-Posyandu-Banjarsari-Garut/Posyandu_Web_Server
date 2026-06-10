import { NewParent, Parent } from '@/db'
import {
    ParentRepository,
    ParentQueryFilters
} from '@/repositories/parents-repository'
import { createPaginationMeta } from '@/utils/pagination'

export class ParentService {
    constructor(private readonly parent_repository: ParentRepository) {}

    async createParent(parent_payload: NewParent): Promise<Parent> {
        const existingProfile = await this.parent_repository.findByUserId(
            parent_payload.user_id
        )
        if (existingProfile) {
            throw new Error('User already has a parent profile')
        }

        if (parent_payload.identity_number) {
            const isNikUsed =
                await this.parent_repository.existsByIdentityNumber(
                    parent_payload.identity_number
                )
            if (isNikUsed) {
                throw new Error('Identity number (NIK) is already registered')
            }
        }

        return this.parent_repository.create(parent_payload)
    }

    async getParents(query_filters?: ParentQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.parent_repository.getParents(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getParentById(public_id: string): Promise<Parent> {
        const parent = await this.parent_repository.findById(public_id)
        if (!parent) throw new Error('Parent profile not found')
        return parent
    }

    async updateParent(
        public_id: string,
        parent_payload: Partial<NewParent>
    ): Promise<Parent> {
        const existingParent = await this.getParentById(public_id)

        if (
            parent_payload.identity_number &&
            parent_payload.identity_number !== existingParent.identity_number
        ) {
            const isNikUsed =
                await this.parent_repository.existsByIdentityNumber(
                    parent_payload.identity_number
                )
            if (isNikUsed) {
                throw new Error(
                    'Identity number (NIK) is already registered by another parent'
                )
            }
        }

        if (
            parent_payload.user_id &&
            parent_payload.user_id !== existingParent.user_id
        ) {
            const existingProfileForNewUser =
                await this.parent_repository.findByUserId(
                    parent_payload.user_id
                )
            if (existingProfileForNewUser) {
                throw new Error('The target user already has a parent profile')
            }
        }

        const updated = await this.parent_repository.update(
            public_id,
            parent_payload
        )
        if (!updated) throw new Error('Failed to update parent profile')
        return updated
    }

    async deleteParent(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Parent> {
        await this.getParentById(public_id)

        const deleted = is_permanent
            ? await this.parent_repository.hardDelete(public_id)
            : await this.parent_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete parent profile')
        return deleted
    }

    async restoreParent(public_id: string): Promise<Parent> {
        const restored = await this.parent_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore parent profile')
        return restored
    }
}
