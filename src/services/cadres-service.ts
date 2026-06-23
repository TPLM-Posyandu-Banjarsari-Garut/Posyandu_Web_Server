import { ApiError } from '@/utils/api-error'
import { NewCadre, Cadre } from '@/db'
import {
    CadreRepository,
    CadreQueryFilters
} from '@/repositories/cadres-repository'
import { createPaginationMeta } from '@/utils/pagination'

export class CadreService {
    constructor(private readonly cadre_repository: CadreRepository) {}

    async createCadre(cadre_payload: NewCadre): Promise<Cadre> {
        const checks = await this.cadre_repository.checkUniqueConstraints({
            user_id: cadre_payload.user_id,
            posyandu_id: cadre_payload.posyandu_id
        })

        if (checks.isAlreadyCadre) {
            throw ApiError.conflict('User is already a cadre in this posyandu')
        }

        return this.cadre_repository.create(cadre_payload)
    }

    async getCadres(query_filters?: CadreQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.cadre_repository.getCadres(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getCadreById(public_id: string): Promise<Cadre> {
        const cadre = await this.cadre_repository.findById(public_id)
        if (!cadre) throw ApiError.notFound('Cadre not found')
        return cadre
    }

    async updateCadre(
        public_id: string,
        cadre_payload: Partial<NewCadre>
    ): Promise<Cadre> {
        const existingCadre = await this.getCadreById(public_id)

        const targetUserId = cadre_payload.user_id || existingCadre.user_id
        const targetPosyanduId =
            cadre_payload.posyandu_id || existingCadre.posyandu_id

        if (
            targetUserId !== existingCadre.user_id ||
            targetPosyanduId !== existingCadre.posyandu_id
        ) {
            const checks = await this.cadre_repository.checkUniqueConstraints({
                user_id: targetUserId,
                posyandu_id: targetPosyanduId
            })

            if (checks.isAlreadyCadre) {
                throw ApiError.conflict(
                    'User is already a cadre in this posyandu'
                )
            }
        }

        const updated = await this.cadre_repository.update(
            public_id,
            cadre_payload
        )
        if (!updated) throw ApiError.badRequest('Failed to update cadre')
        return updated
    }

    async deleteCadre(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Cadre> {
        const existing = await this.cadre_repository.findById(public_id, true)
        if (!existing) throw ApiError.notFound('Cadre not found')

        if (!is_permanent && existing.status === 'inactive') {
            return existing
        }

        const deleted = is_permanent
            ? await this.cadre_repository.hardDelete(public_id)
            : await this.cadre_repository.softDelete(public_id)

        if (!deleted) throw ApiError.badRequest('Failed to delete cadre')
        return deleted
    }

    async restoreCadre(public_id: string): Promise<Cadre> {
        const restored = await this.cadre_repository.restore(public_id)
        if (!restored) throw ApiError.badRequest('Failed to restore cadre')
        return restored
    }
}
