import { randomInt } from 'node:crypto'
import { createPaginationMeta } from '@/utils/pagination'
import { NewMidwife, Midwife } from '@/db'
import {
    MidwifeRepository,
    MidwifeQueryFilters
} from '@/repositories/midwifes-repository'

export class MidwifeService {
    constructor(private readonly midwife_repository: MidwifeRepository) {}

    async createMidwife(midwife_payload: NewMidwife): Promise<Midwife> {
        if (midwife_payload.user_id) {
            const existingMidwife = await this.midwife_repository.findByUserId(
                midwife_payload.user_id
            )
            if (existingMidwife) {
                throw new Error('User is already registered as a midwife')
            }
        }

        if (!midwife_payload.identity_number) {
            let uniqueNik = ''
            let isUsed = true
            while (isUsed) {
                uniqueNik = randomInt(
                    1000000000000000,
                    10000000000000000
                ).toString()
                isUsed =
                    await this.midwife_repository.existsByIdentityNumber(
                        uniqueNik
                    )
            }
            midwife_payload.identity_number = uniqueNik
        }

        const isIdentityNumberUsed =
            await this.midwife_repository.existsByIdentityNumber(
                midwife_payload.identity_number
            )
        if (isIdentityNumberUsed) {
            throw new Error('Identity number (NIK) is already registered')
        }

        if (midwife_payload.license_number) {
            const isStrUsed = await this.midwife_repository.existsByStrNumber(
                midwife_payload.license_number
            )
            if (isStrUsed) {
                throw new Error('STR number is already registered')
            }
        }

        return this.midwife_repository.create(midwife_payload)
    }

    async getMidwifes(query_filters?: MidwifeQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.midwife_repository.getMidwifes(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getMidwifeById(public_id: string): Promise<Midwife> {
        const midwife = await this.midwife_repository.findById(public_id)
        if (!midwife) throw new Error('Midwife not found')
        return midwife
    }

    async updateMidwife(
        public_id: string,
        midwife_payload: Partial<NewMidwife>
    ): Promise<Midwife> {
        const existingMidwife = await this.getMidwifeById(public_id)

        if (
            midwife_payload.user_id &&
            midwife_payload.user_id !== existingMidwife.user_id
        ) {
            const existingMidwifeForUser =
                await this.midwife_repository.findByUserId(
                    midwife_payload.user_id
                )
            if (
                existingMidwifeForUser &&
                existingMidwifeForUser.id !== public_id
            ) {
                throw new Error('User is already registered as a midwife')
            }
        }

        if (
            midwife_payload.identity_number &&
            midwife_payload.identity_number !== existingMidwife.identity_number
        ) {
            const isIdentityNumberUsed =
                await this.midwife_repository.existsByIdentityNumber(
                    midwife_payload.identity_number
                )
            if (isIdentityNumberUsed) {
                throw new Error(
                    'Identity number (NIK) is already registered by another midwife'
                )
            }
        }

        if (
            midwife_payload.license_number &&
            midwife_payload.license_number !== existingMidwife.license_number
        ) {
            const isStrUsed = await this.midwife_repository.existsByStrNumber(
                midwife_payload.license_number
            )
            if (isStrUsed) {
                throw new Error(
                    'STR number is already registered by another midwife'
                )
            }
        }

        const updated = await this.midwife_repository.update(
            public_id,
            midwife_payload
        )
        if (!updated) throw new Error('Failed to update midwife')
        return updated
    }

    async deleteMidwife(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Midwife> {
        const existing = await this.midwife_repository.findById(public_id, true)
        if (!existing) throw new Error('Midwife not found')

        if (!is_permanent && existing.status === 'inactive') {
            return existing
        }

        const deleted = is_permanent
            ? await this.midwife_repository.hardDelete(public_id)
            : await this.midwife_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete midwife')
        return deleted
    }

    async restoreMidwife(public_id: string): Promise<Midwife> {
        const restored = await this.midwife_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore midwife')
        return restored
    }
}
