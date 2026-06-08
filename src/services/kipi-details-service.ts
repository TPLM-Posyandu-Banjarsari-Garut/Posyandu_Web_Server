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
            throw new Error(
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
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / limit)
            }
        }
    }

    async getKipiDetailById(public_id: string): Promise<KipiDetail> {
        const kipi = await this.kipi_detail_repository.findById(public_id)
        if (!kipi) throw new Error('KIPI detail not found')
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
                throw new Error(
                    'KIPI detail for this immunization record already exists'
                )
            }
        }

        const updated = await this.kipi_detail_repository.update(
            public_id,
            kipi_payload
        )
        if (!updated) throw new Error('Failed to update KIPI detail')
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

        if (!deleted) throw new Error('Failed to delete KIPI detail')
        return deleted
    }

    async restoreKipiDetail(public_id: string): Promise<KipiDetail> {
        const restored = await this.kipi_detail_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore KIPI detail')
        return restored
    }
}
