import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewVaccine, Vaccine } from '@/db'
import { cacheGetOrLoad, invalidateCache } from '@/utils/cloudflare-cache'
import {
    VaccineRepository,
    VaccineQueryFilters
} from '@/repositories/vaccines-repository'

export class VaccineService {
    constructor(private readonly vaccine_repository: VaccineRepository) {}

    async createVaccine(vaccine_payload: NewVaccine): Promise<Vaccine> {
        const checks = await this.vaccine_repository.checkUniqueConstraints({
            name: vaccine_payload.name || undefined,
            code: vaccine_payload.code || undefined
        })

        if (checks.nameExists) {
            throw ApiError.conflict('Vaccine name is already registered')
        }
        if (checks.codeExists) {
            throw ApiError.conflict('Vaccine code is already registered')
        }

        const created = await this.vaccine_repository.create(vaccine_payload)
        await invalidateCache('vaccines')
        return created
    }

    async getVaccines(query_filters?: VaccineQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        return cacheGetOrLoad(
            'vaccines',
            { type: 'list', filters: query_filters },
            300,
            async () => {
                const { data, totalItems } =
                    await this.vaccine_repository.getVaccines(query_filters)
                return {
                    data,
                    meta: createPaginationMeta(page, limit, totalItems)
                }
            }
        )
    }

    async getVaccineById(public_id: string): Promise<Vaccine> {
        const vaccine = await cacheGetOrLoad(
            'vaccines',
            { type: 'item', id: public_id },
            300,
            () => this.vaccine_repository.findById(public_id)
        )
        if (!vaccine) throw ApiError.notFound('Vaccine not found')
        return vaccine
    }

    async updateVaccine(
        public_id: string,
        vaccine_payload: Partial<NewVaccine>
    ): Promise<Vaccine> {
        const existingVaccine = await this.getVaccineById(public_id)

        const checks = await this.vaccine_repository.checkUniqueConstraints({
            name:
                vaccine_payload.name &&
                vaccine_payload.name !== existingVaccine.name
                    ? vaccine_payload.name
                    : undefined,
            code:
                vaccine_payload.code &&
                vaccine_payload.code !== existingVaccine.code
                    ? vaccine_payload.code
                    : undefined
        })

        if (checks.nameExists) {
            throw ApiError.conflict(
                'Vaccine name is already registered by another vaccine'
            )
        }
        if (checks.codeExists) {
            throw ApiError.conflict(
                'Vaccine code is already registered by another vaccine'
            )
        }

        const updated = await this.vaccine_repository.update(
            public_id,
            vaccine_payload
        )
        if (!updated) throw ApiError.badRequest('Failed to update vaccine')
        await invalidateCache('vaccines')
        return updated
    }

    async deleteVaccine(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Vaccine> {
        await this.getVaccineById(public_id)

        const deleted = is_permanent
            ? await this.vaccine_repository.hardDelete(public_id)
            : await this.vaccine_repository.softDelete(public_id)

        if (!deleted) throw ApiError.badRequest('Failed to delete vaccine')
        await invalidateCache('vaccines')
        return deleted
    }

    async restoreVaccine(public_id: string): Promise<Vaccine> {
        const restored = await this.vaccine_repository.restore(public_id)
        if (!restored) throw ApiError.badRequest('Failed to restore vaccine')
        await invalidateCache('vaccines')
        return restored
    }
}
