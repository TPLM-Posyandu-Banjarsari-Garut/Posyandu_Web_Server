import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewKipiDetail, KipiDetail } from '@/db'
import {
    KipiDetailRepository,
    KipiDetailQueryFilters
} from '@/repositories/kipi-details-repository'

export class KipiDetailService {
    constructor(
        private readonly kipi_detail_repository: KipiDetailRepository
    ) {}

    async createKipiDetail(kipi_payload: NewKipiDetail): Promise<KipiDetail> {
        const isExists =
            await this.kipi_detail_repository.existsByImmunizationRecordId(
                kipi_payload.immunization_record_id
            )
        if (isExists) {
            throw ApiError.conflict(
                'KIPI detail for this immunization record already exists'
            )
        }

        return this.kipi_detail_repository.create(kipi_payload)
    }

    async getKipiDetails(query_filters?: KipiDetailQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.kipi_detail_repository.getKipiDetails(query_filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getKipiDetailById(public_id: string): Promise<KipiDetail> {
        const kipi = await this.kipi_detail_repository.findById(public_id)
        if (!kipi) throw ApiError.notFound('KIPI detail not found')
        return kipi
    }

    async updateKipiDetail(
        public_id: string,
        kipi_payload: Partial<NewKipiDetail>
    ): Promise<KipiDetail> {
        const existingKipi = await this.getKipiDetailById(public_id)

        if (
            kipi_payload.immunization_record_id &&
            kipi_payload.immunization_record_id !==
                existingKipi.immunization_record_id
        ) {
            const isExists =
                await this.kipi_detail_repository.existsByImmunizationRecordId(
                    kipi_payload.immunization_record_id
                )
            if (isExists) {
                throw ApiError.conflict(
                    'KIPI detail for this immunization record already exists'
                )
            }
        }

        const updated = await this.kipi_detail_repository.update(
            public_id,
            kipi_payload
        )
        if (!updated) throw ApiError.badRequest('Failed to update KIPI detail')
        return updated
    }

    async deleteKipiDetail(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<KipiDetail> {
        await this.getKipiDetailById(public_id)

        const deleted = is_permanent
            ? await this.kipi_detail_repository.hardDelete(public_id)
            : await this.kipi_detail_repository.softDelete(public_id)

        if (!deleted) throw ApiError.badRequest('Failed to delete KIPI detail')
        return deleted
    }

    async restoreKipiDetail(public_id: string): Promise<KipiDetail> {
        const restored = await this.kipi_detail_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore KIPI detail')
        return restored
    }
}
