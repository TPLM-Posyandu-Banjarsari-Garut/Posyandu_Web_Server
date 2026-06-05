import { NewParent, Parent } from '@/db'
import {
    ParentRepository,
    ParentQueryFilters
} from '@/repositories/parents-repository'

export class ParentService {
    constructor(private readonly parent_repository: ParentRepository) {}

    async createParent(parent_payload: NewParent): Promise<Parent> {
        // Business logic: Ensure the user doesn't already have a parent profile
        const existingProfile = await this.parent_repository.findByUserId(
            parent_payload.user_id
        )
        if (existingProfile) {
            throw new Error('User already has a parent profile')
        }

        // Business logic: Ensure identity_number (NIK) is unique if provided
        if (parent_payload.identitiy_number) {
            const isNikUsed =
                await this.parent_repository.existsByIdentityNumber(
                    parent_payload.identitiy_number
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
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / limit)
            }
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
        // Ensure the parent exists before updating
        const existingParent = await this.getParentById(public_id)

        // If updating identity_number, ensure it doesn't belong to another parent
        if (
            parent_payload.identitiy_number &&
            parent_payload.identitiy_number !== existingParent.identitiy_number
        ) {
            const isNikUsed =
                await this.parent_repository.existsByIdentityNumber(
                    parent_payload.identitiy_number
                )
            if (isNikUsed) {
                throw new Error(
                    'Identity number (NIK) is already registered by another parent'
                )
            }
        }

        // If updating user_id, ensure the new user_id doesn't already have a profile
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

    async deleteParent(public_id: string): Promise<Parent> {
        // Ensure the parent exists before deleting
        await this.getParentById(public_id)

        const deleted = await this.parent_repository.delete(public_id)
        if (!deleted) throw new Error('Failed to delete parent profile')
        return deleted
    }
}
