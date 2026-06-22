import { NewCadre, Cadre } from '@/db'
import {
    CadreRepository,
    CadreQueryFilters
} from '@/repositories/cadres-repository'
import { createPaginationMeta } from '@/utils/pagination'

export class CadreService {
    constructor(private readonly cadre_repository: CadreRepository) {}

    async createCadre(cadre_payload: NewCadre): Promise<Cadre> {
        const existingCadres = await this.cadre_repository.findByUserId(
            cadre_payload.user_id
        )
        const isAlreadyCadre = existingCadres.some(
            c => c.posyandu_id === cadre_payload.posyandu_id
        )

        if (isAlreadyCadre) {
            throw new Error('User is already a cadre in this posyandu')
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
        if (!cadre) throw new Error('Cadre not found')
        return cadre
    }

    async updateCadre(
        public_id: string,
        cadre_payload: Partial<NewCadre>
    ): Promise<Cadre> {
        const existingCadre = await this.getCadreById(public_id)

        if (cadre_payload.user_id || cadre_payload.posyandu_id) {
            const targetUserId = cadre_payload.user_id || existingCadre.user_id
            const targetPosyanduId =
                cadre_payload.posyandu_id || existingCadre.posyandu_id

            if (
                targetUserId !== existingCadre.user_id ||
                targetPosyanduId !== existingCadre.posyandu_id
            ) {
                const existingCadresForUser =
                    await this.cadre_repository.findByUserId(targetUserId)
                const isAlreadyCadre = existingCadresForUser.some(
                    c =>
                        c.posyandu_id === targetPosyanduId && c.id !== public_id
                )

                if (isAlreadyCadre) {
                    throw new Error('User is already a cadre in this posyandu')
                }
            }
        }

        const updated = await this.cadre_repository.update(
            public_id,
            cadre_payload
        )
        if (!updated) throw new Error('Failed to update cadre')
        return updated
    }

    async deleteCadre(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Cadre> {
        const existing = await this.cadre_repository.findById(public_id, true)
        if (!existing) throw new Error('Cadre not found')

        if (!is_permanent && existing.status === 'inactive') {
            return existing
        }

        const deleted = is_permanent
            ? await this.cadre_repository.hardDelete(public_id)
            : await this.cadre_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete cadre')
        return deleted
    }

    async restoreCadre(public_id: string): Promise<Cadre> {
        const restored = await this.cadre_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore cadre')
        return restored
    }
}
