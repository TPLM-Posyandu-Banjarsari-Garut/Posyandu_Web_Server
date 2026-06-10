import { createPaginationMeta } from '@/utils/pagination'
import { NewPosyandu, Posyandu } from '@/db'
import {
    PosyanduRepository,
    PosyanduQueryFilters
} from '@/repositories/posyandus-repository'

export class PosyanduService {
    constructor(private readonly posyandu_repository: PosyanduRepository) {}

    async createPosyandu(posyandu_payload: NewPosyandu): Promise<Posyandu> {
        const isNameUsed = await this.posyandu_repository.existsByName(
            posyandu_payload.name
        )
        if (isNameUsed) {
            throw new Error('Posyandu name is already registered')
        }

        return this.posyandu_repository.create(posyandu_payload)
    }

    async getPosyandus(query_filters?: PosyanduQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.posyandu_repository.getPosyandus(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getPosyanduById(public_id: string): Promise<Posyandu> {
        const posyandu = await this.posyandu_repository.findById(public_id)
        if (!posyandu) throw new Error('Posyandu not found')
        return posyandu
    }

    async updatePosyandu(
        public_id: string,
        posyandu_payload: Partial<NewPosyandu>
    ): Promise<Posyandu> {
        const existingPosyandu = await this.getPosyanduById(public_id)

        if (
            posyandu_payload.name &&
            posyandu_payload.name !== existingPosyandu.name
        ) {
            const isNameUsed = await this.posyandu_repository.existsByName(
                posyandu_payload.name
            )
            if (isNameUsed) {
                throw new Error(
                    'Posyandu name is already registered by another posyandu'
                )
            }
        }

        const updated = await this.posyandu_repository.update(
            public_id,
            posyandu_payload
        )
        if (!updated) throw new Error('Failed to update posyandu')
        return updated
    }

    async deletePosyandu(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Posyandu> {
        await this.getPosyanduById(public_id)

        const deleted = is_permanent
            ? await this.posyandu_repository.hardDelete(public_id)
            : await this.posyandu_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete posyandu')
        return deleted
    }

    async restorePosyandu(public_id: string): Promise<Posyandu> {
        const restored = await this.posyandu_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore posyandu')
        return restored
    }
}
