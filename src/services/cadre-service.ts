import { NewCadre, Cadre } from '@/db'
import {
    CadreRepository,
    CadreQueryFilters
} from '@/repositories/cadre-repository'

export class CadreService {
    constructor(private readonly cadre_repository: CadreRepository) {}

    async createCadre(cadre_payload: NewCadre): Promise<Cadre> {
        // Business logic: Ensure the user is not already a cadre in the same posyandu
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
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / limit)
            }
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
        // Ensure the cadre exists before updating
        await this.getCadreById(public_id)

        // If they are trying to change posyandu_id or user_id, we might want to check for duplicates again
        if (cadre_payload.user_id || cadre_payload.posyandu_id) {
            const existingCadre = await this.getCadreById(public_id)
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
                        c.posyandu_id === targetPosyanduId &&
                        c.public_id !== public_id
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

    async deleteCadre(public_id: string): Promise<Cadre> {
        // Ensure the cadre exists before deleting
        await this.getCadreById(public_id)

        const deleted = await this.cadre_repository.delete(public_id)
        if (!deleted) throw new Error('Failed to delete cadre')
        return deleted
    }
}
