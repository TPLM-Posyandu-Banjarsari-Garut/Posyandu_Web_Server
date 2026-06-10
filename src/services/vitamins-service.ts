import { createPaginationMeta } from '@/utils/pagination'
import { NewVitamin, Vitamin } from '@/db'
import {
    VitaminRepository,
    VitaminQueryFilters
} from '@/repositories/vitamins-repository'

export class VitaminService {
    constructor(private readonly vitamin_repository: VitaminRepository) {}

    async createVitamin(vitamin_payload: NewVitamin): Promise<Vitamin> {
        const isNameUsed = await this.vitamin_repository.existsByName(
            vitamin_payload.name
        )
        if (isNameUsed) {
            throw new Error('Vitamin name is already registered')
        }

        return this.vitamin_repository.create(vitamin_payload)
    }

    async getVitamins(query_filters?: VitaminQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.vitamin_repository.getVitamins(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getVitaminById(public_id: string): Promise<Vitamin> {
        const vitamin = await this.vitamin_repository.findById(public_id)
        if (!vitamin) throw new Error('Vitamin not found')
        return vitamin
    }

    async updateVitamin(
        public_id: string,
        vitamin_payload: Partial<NewVitamin>
    ): Promise<Vitamin> {
        const existingVitamin = await this.getVitaminById(public_id)

        if (
            vitamin_payload.name &&
            vitamin_payload.name !== existingVitamin.name
        ) {
            const isNameUsed = await this.vitamin_repository.existsByName(
                vitamin_payload.name
            )
            if (isNameUsed) {
                throw new Error(
                    'Vitamin name is already registered by another vitamin'
                )
            }
        }

        const updated = await this.vitamin_repository.update(
            public_id,
            vitamin_payload
        )
        if (!updated) throw new Error('Failed to update vitamin')
        return updated
    }

    async deleteVitamin(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Vitamin> {
        await this.getVitaminById(public_id)

        const deleted = is_permanent
            ? await this.vitamin_repository.hardDelete(public_id)
            : await this.vitamin_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete vitamin')
        return deleted
    }

    async restoreVitamin(public_id: string): Promise<Vitamin> {
        const restored = await this.vitamin_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore vitamin')
        return restored
    }
}
