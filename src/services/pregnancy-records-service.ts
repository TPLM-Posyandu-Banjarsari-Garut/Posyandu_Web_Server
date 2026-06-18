import { createPaginationMeta } from '@/utils/pagination'
import { NewPregnancyRecord, PregnancyRecord } from '@/db'
import {
    PregnancyRecordsRepository,
    PregnancyRecordQueryFilters
} from '@/repositories/pregnancy-records-repository'
import { ApiError } from '@/utils/api-error'

export class PregnancyRecordsService {
    constructor(
        private readonly pregnancy_records_repository: PregnancyRecordsRepository
    ) {}

    async createPregnancyRecord(
        payload: NewPregnancyRecord
    ): Promise<PregnancyRecord> {
        return this.pregnancy_records_repository.create(payload)
    }

    async getPregnancyRecords(filters?: PregnancyRecordQueryFilters) {
        const { page = 1, limit = 10 } = filters || {}
        const { data, totalItems } =
            await this.pregnancy_records_repository.getPregnancyRecords(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getPregnancyRecordById(id: string): Promise<PregnancyRecord> {
        const record = await this.pregnancy_records_repository.findById(id)
        if (!record) throw ApiError.notFound('Pregnancy record not found')
        return record
    }

    async updatePregnancyRecord(
        id: string,
        payload: Partial<NewPregnancyRecord>
    ): Promise<PregnancyRecord> {
        await this.getPregnancyRecordById(id)
        const updated = await this.pregnancy_records_repository.update(
            id,
            payload
        )
        if (!updated) throw ApiError.server('Failed to update pregnancy record')
        return updated
    }

    async deletePregnancyRecord(
        id: string,
        isPermanent = false
    ): Promise<PregnancyRecord> {
        await this.getPregnancyRecordById(id)
        const deleted = isPermanent
            ? await this.pregnancy_records_repository.hardDelete(id)
            : await this.pregnancy_records_repository.softDelete(id)

        if (!deleted) throw ApiError.server('Failed to delete pregnancy record')
        return deleted
    }

    async restorePregnancyRecord(id: string): Promise<PregnancyRecord> {
        const restored = await this.pregnancy_records_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore pregnancy record')
        return restored
    }
}
