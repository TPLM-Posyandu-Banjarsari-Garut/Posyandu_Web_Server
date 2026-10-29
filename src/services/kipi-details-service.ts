import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewKipiDetail, KipiDetail } from '@/db'
import {
    KipiDetailRepository,
    KipiDetailQueryFilters
} from '@/repositories/kipi-details-repository'
import type { AuthenticatedUser } from '@/services/auth-service'

export class KipiDetailService {
    constructor(
        private readonly kipi_detail_repository: KipiDetailRepository
    ) {}

    async createKipiDetail(
        kipi_payload: NewKipiDetail,
        currentUser: AuthenticatedUser
    ): Promise<KipiDetail> {
        this.assertCanWrite(currentUser)
        await this.assertImmunizationRecordExists(
            kipi_payload.immunization_record_id
        )

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

    async getKipiDetails(
        query_filters: KipiDetailQueryFilters | undefined
    ) {
        const { page = 1, limit = 10 } = query_filters || {}
        const filters = { ...query_filters }
        const { data, totalItems } =
            await this.kipi_detail_repository.getKipiDetails(filters)
        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getKipiDetailById(
        public_id: string,
        _currentUser: AuthenticatedUser,
        includeDeleted = false
    ): Promise<KipiDetail> {
        const kipi = await this.kipi_detail_repository.findById(
            public_id,
            includeDeleted
        )
        if (!kipi) throw ApiError.notFound('KIPI detail not found')
        await this.assertImmunizationRecordExists(
            kipi.immunization_record_id,
            includeDeleted
        )
        return kipi
    }

    async updateKipiDetail(
        public_id: string,
        kipi_payload: Partial<NewKipiDetail>,
        currentUser: AuthenticatedUser
    ): Promise<KipiDetail> {
        this.assertCanWrite(currentUser)
        const existingKipi = await this.getKipiDetailById(
            public_id,
            currentUser
        )
        const immunizationRecordId =
            kipi_payload.immunization_record_id ??
            existingKipi.immunization_record_id
        await this.assertImmunizationRecordExists(immunizationRecordId)

        if (
            immunizationRecordId !== existingKipi.immunization_record_id &&
            (await this.kipi_detail_repository.existsByImmunizationRecordId(
                immunizationRecordId
            ))
        ) {
            throw ApiError.conflict(
                'KIPI detail for this immunization record already exists'
            )
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
        is_permanent: boolean,
        currentUser: AuthenticatedUser
    ): Promise<KipiDetail> {
        this.assertCanWrite(currentUser)
        const kipi = await this.getKipiDetailById(public_id, currentUser)
        await this.assertImmunizationRecordExists(
            kipi.immunization_record_id
        )

        const deleted = is_permanent
            ? await this.kipi_detail_repository.hardDelete(public_id)
            : await this.kipi_detail_repository.softDelete(public_id)
        if (!deleted) throw ApiError.badRequest('Failed to delete KIPI detail')
        return deleted
    }

    async restoreKipiDetail(
        public_id: string,
        currentUser: AuthenticatedUser
    ): Promise<KipiDetail> {
        this.assertCanWrite(currentUser)
        const kipi = await this.getKipiDetailById(
            public_id,
            currentUser,
            true
        )
        await this.assertImmunizationRecordExists(
            kipi.immunization_record_id,
            true
        )

        const restored = await this.kipi_detail_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore KIPI detail')
        return restored
    }

    private async assertImmunizationRecordExists(
        recordId: string,
        includeDeleted = false
    ): Promise<void> {
        const record =
            await this.kipi_detail_repository.findImmunizationRecordById(
                recordId,
                includeDeleted
            )
        if (!record) throw ApiError.notFound('Immunization record not found')
    }

    private assertCanWrite(currentUser: AuthenticatedUser): void {
        if (currentUser.role === 'parent') {
            throw ApiError.forbidden('Parents cannot modify KIPI details')
        }
    }

}
