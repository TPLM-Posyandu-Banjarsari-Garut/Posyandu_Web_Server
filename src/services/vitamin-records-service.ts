import { NewVitaminRecord, VitaminRecord } from '@/db'
import {
    VitaminRecordRepository,
    VitaminRecordQueryFilters
} from '@/repositories/vitamin-records-repository'

export class VitaminRecordService {
    constructor(
        private readonly vitamin_record_repository: VitaminRecordRepository
    ) {}

    async createVitaminRecord(
        record_payload: NewVitaminRecord
    ): Promise<VitaminRecord> {
        const isDuplicate =
            await this.vitamin_record_repository.existsByUniqueKey(
                record_payload.children_id,
                record_payload.distribution_period,
                record_payload.distribution_year
            )
        if (isDuplicate) {
            throw new Error(
                'Vitamin record for this child, period, and year already exists'
            )
        }

        return this.vitamin_record_repository.create(record_payload)
    }

    async getVitaminRecords(query_filters?: VitaminRecordQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.vitamin_record_repository.getVitaminRecords(
                query_filters
            )

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

    async getVitaminRecordById(public_id: string): Promise<VitaminRecord> {
        const record = await this.vitamin_record_repository.findById(public_id)
        if (!record) throw new Error('Vitamin record not found')
        return record
    }

    async updateVitaminRecord(
        public_id: string,
        record_payload: Partial<NewVitaminRecord>
    ): Promise<VitaminRecord> {
        const existingRecord = await this.getVitaminRecordById(public_id)

        const childId = record_payload.children_id ?? existingRecord.children_id
        const period =
            record_payload.distribution_period ??
            existingRecord.distribution_period
        const year =
            record_payload.distribution_year ?? existingRecord.distribution_year

        if (
            childId !== existingRecord.children_id ||
            period !== existingRecord.distribution_period ||
            year !== existingRecord.distribution_year
        ) {
            const isDuplicate =
                await this.vitamin_record_repository.existsByUniqueKey(
                    childId,
                    period,
                    year
                )
            if (isDuplicate) {
                throw new Error(
                    'Vitamin record with the same child, period, and year already exists'
                )
            }
        }

        const updated = await this.vitamin_record_repository.update(
            public_id,
            record_payload
        )
        if (!updated) throw new Error('Failed to update vitamin record')
        return updated
    }

    async deleteVitaminRecord(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<VitaminRecord> {
        await this.getVitaminRecordById(public_id)

        const deleted = is_permanent
            ? await this.vitamin_record_repository.hardDelete(public_id)
            : await this.vitamin_record_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete vitamin record')
        return deleted
    }

    async restoreVitaminRecord(public_id: string): Promise<VitaminRecord> {
        const restored = await this.vitamin_record_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore vitamin record')
        return restored
    }
}
