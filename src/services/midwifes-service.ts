import { ApiError } from '@/utils/api-error'
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
        let isIdentityNumberChecked = false
        if (!midwife_payload.identity_number) {
            let uniqueNik = ''
            let isUsed = true
            while (isUsed) {
                // FIX: randomInt tidak boleh melebihi Number.MAX_SAFE_INTEGER atau range > 2^48.
                // Solusi: gabungkan dua bilangan 8-digit yang aman secara kriptografis → NIK 16-digit.
                const part1 = randomInt(10_000_000, 99_999_999).toString() // 8 digit
                const part2 = randomInt(10_000_000, 99_999_999).toString() // 8 digit
                uniqueNik = part1 + part2                                  // 16 digit total
                isUsed =
                    await this.midwife_repository.existsByIdentityNumber(
                        uniqueNik
                    )
            }
            midwife_payload.identity_number = uniqueNik
            isIdentityNumberChecked = true
        }

        const checks = await this.midwife_repository.checkUniqueConstraints({
            user_id: midwife_payload.user_id || undefined,
            identity_number:
                midwife_payload.identity_number && !isIdentityNumberChecked
                    ? midwife_payload.identity_number
                    : undefined,
            license_number: midwife_payload.license_number || undefined
        })

        if (checks.userExists) {
            throw ApiError.conflict('User is already registered as a midwife')
        }
        if (checks.identityExists) {
            throw ApiError.badRequest(
                'Identity number (NIK) is already registered'
            )
        }
        if (checks.licenseExists) {
            throw ApiError.conflict('STR number is already registered')
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
        if (!midwife) throw ApiError.notFound('Midwife not found')
        return midwife
    }

    async updateMidwife(
        public_id: string,
        midwife_payload: Partial<NewMidwife>
    ): Promise<Midwife> {
        const existingMidwife = await this.getMidwifeById(public_id)

        const checks = await this.midwife_repository.checkUniqueConstraints({
            user_id:
                midwife_payload.user_id &&
                midwife_payload.user_id !== existingMidwife.user_id
                    ? midwife_payload.user_id
                    : undefined,
            identity_number:
                midwife_payload.identity_number &&
                midwife_payload.identity_number !==
                    existingMidwife.identity_number
                    ? midwife_payload.identity_number
                    : undefined,
            license_number:
                midwife_payload.license_number &&
                midwife_payload.license_number !==
                    existingMidwife.license_number
                    ? midwife_payload.license_number
                    : undefined
        })

        if (checks.userExists) {
            throw ApiError.conflict('User is already registered as a midwife')
        }
        if (checks.identityExists) {
            throw ApiError.badRequest(
                'Identity number (NIK) is already registered by another midwife'
            )
        }
        if (checks.licenseExists) {
            throw ApiError.conflict(
                'STR number is already registered by another midwife'
            )
        }

        const updated = await this.midwife_repository.update(
            public_id,
            midwife_payload
        )
        if (!updated) throw ApiError.badRequest('Failed to update midwife')
        return updated
    }

    async deleteMidwife(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Midwife> {
        const existing = await this.midwife_repository.findById(public_id, true)
        if (!existing) throw ApiError.notFound('Midwife not found')

        if (!is_permanent && existing.status === 'inactive') {
            return existing
        }

        const deleted = is_permanent
            ? await this.midwife_repository.hardDelete(public_id)
            : await this.midwife_repository.softDelete(public_id)

        if (!deleted) throw ApiError.badRequest('Failed to delete midwife')
        return deleted
    }

    async restoreMidwife(public_id: string): Promise<Midwife> {
        const restored = await this.midwife_repository.restore(public_id)
        if (!restored) throw ApiError.badRequest('Failed to restore midwife')
        return restored
    }
}
