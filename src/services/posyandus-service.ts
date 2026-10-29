import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { cacheGetOrLoad, invalidateCache } from '@/utils/cloudflare-cache'
import { NewPosyandu, Posyandu } from '@/db'
import {
    PosyanduRepository,
    PosyanduQueryFilters
} from '@/repositories/posyandus-repository'

export class PosyanduService {
    constructor(private readonly posyandu_repository: PosyanduRepository) {}

    async createPosyandu(posyandu_payload: NewPosyandu): Promise<Posyandu> {
        const checks = await this.posyandu_repository.checkUniqueConstraints({
            name: posyandu_payload.name || undefined
        })
        if (checks.nameExists) {
            throw ApiError.conflict('Posyandu name is already registered')
        }

        const created = await this.posyandu_repository.create(posyandu_payload)
        await invalidateCache('posyandus')
        return created
    }

    async getPosyandus(query_filters?: PosyanduQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        return cacheGetOrLoad(
            'posyandus',
            { type: 'list', filters: query_filters },
            180,
            async () => {
                const { data, totalItems } =
                    await this.posyandu_repository.getPosyandus(query_filters)
                return {
                    data,
                    meta: createPaginationMeta(page, limit, totalItems)
                }
            }
        )
    }

    async getPosyanduById(public_id: string): Promise<Posyandu> {
        const posyandu = await cacheGetOrLoad(
            'posyandus',
            { type: 'item', id: public_id },
            180,
            () => this.posyandu_repository.findById(public_id)
        )
        if (!posyandu) throw ApiError.notFound('Posyandu not found')
        return posyandu
    }

    async updatePosyandu(
        public_id: string,
        posyandu_payload: Partial<NewPosyandu>
    ): Promise<Posyandu> {
        const existingPosyandu = await this.getPosyanduById(public_id)

        const checks = await this.posyandu_repository.checkUniqueConstraints({
            name:
                posyandu_payload.name &&
                posyandu_payload.name !== existingPosyandu.name
                    ? posyandu_payload.name
                    : undefined
        })

        if (checks.nameExists) {
            throw ApiError.conflict(
                'Posyandu name is already registered by another posyandu'
            )
        }

        const updated = await this.posyandu_repository.update(
            public_id,
            posyandu_payload
        )
        if (!updated) throw ApiError.badRequest('Failed to update posyandu')
        await invalidateCache('posyandus')
        return updated
    }

    async deletePosyandu(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Posyandu> {
        const existing = await this.posyandu_repository.findById(
            public_id,
            true
        )
        if (!existing) throw ApiError.notFound('Posyandu not found')

        if (!is_permanent && existing.status === 'inactive') {
            return existing
        }

        const deleted = is_permanent
            ? await this.posyandu_repository.hardDelete(public_id)
            : await this.posyandu_repository.softDelete(public_id)

        if (!deleted) throw ApiError.badRequest('Failed to delete posyandu')
        await invalidateCache('posyandus')
        return deleted
    }

    async restorePosyandu(public_id: string): Promise<Posyandu> {
        const restored = await this.posyandu_repository.restore(public_id)
        if (!restored) throw ApiError.badRequest('Failed to restore posyandu')
        await invalidateCache('posyandus')
        return restored
    }
}
