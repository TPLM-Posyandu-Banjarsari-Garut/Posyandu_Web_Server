import { NewMidwife, Midwife } from '@/db'
import {
    MidwifeRepository,
    MidwifeQueryFilters
} from '@/repositories/midwife-repository'

export class MidwifeService {
    constructor(private readonly midwife_repository: MidwifeRepository) {}

    async createMidwife(midwife_payload: NewMidwife): Promise<Midwife> {
        // Business logic: Ensure the user is not already a midwife in the same posyandu
        const existingMidwifes = await this.midwife_repository.findByUserId(
            midwife_payload.user_id
        )
        const isAlreadyMidwifeInPosyandu = existingMidwifes.some(
            m => m.posyandu_id === midwife_payload.posyandu_id
        )

        if (isAlreadyMidwifeInPosyandu) {
            throw new Error('User is already a midwife in this posyandu')
        }

        // Business logic: Ensure license_number (SIPB) is unique if provided
        if (midwife_payload.license_number) {
            const isLicenseUsed =
                await this.midwife_repository.existsByLicenseNumber(
                    midwife_payload.license_number
                )
            if (isLicenseUsed) {
                throw new Error('License number (SIPB) is already registered')
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
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / limit)
            }
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
        // Ensure the midwife exists before updating
        const existingMidwife = await this.getMidwifeById(public_id)

        // If they are trying to change posyandu_id or user_id, check for duplicates
        if (midwife_payload.user_id || midwife_payload.posyandu_id) {
            const targetUserId =
                midwife_payload.user_id || existingMidwife.user_id
            const targetPosyanduId =
                midwife_payload.posyandu_id || existingMidwife.posyandu_id

            if (
                targetUserId !== existingMidwife.user_id ||
                targetPosyanduId !== existingMidwife.posyandu_id
            ) {
                const existingMidwifesForUser =
                    await this.midwife_repository.findByUserId(targetUserId)
                const isAlreadyMidwifeInPosyandu = existingMidwifesForUser.some(
                    m =>
                        m.posyandu_id === targetPosyanduId &&
                        m.public_id !== public_id
                )

                if (isAlreadyMidwifeInPosyandu) {
                    throw new Error(
                        'User is already a midwife in this posyandu'
                    )
                }
            }
        }

        // If updating license_number, ensure it doesn't belong to another midwife
        if (
            midwife_payload.license_number &&
            midwife_payload.license_number !== existingMidwife.license_number
        ) {
            const isLicenseUsed =
                await this.midwife_repository.existsByLicenseNumber(
                    midwife_payload.license_number
                )
            if (isLicenseUsed) {
                throw new Error(
                    'License number (SIPB) is already registered by another midwife'
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

    async deleteMidwife(public_id: string): Promise<Midwife> {
        // Ensure the midwife exists before deleting
        await this.getMidwifeById(public_id)

        const deleted = await this.midwife_repository.delete(public_id)
        if (!deleted) throw new Error('Failed to delete midwife')
        return deleted
    }
}
