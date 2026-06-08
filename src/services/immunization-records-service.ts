import { NewImmunizationRecord, ImmunizationRecord } from '@/db'
import {
    ImmunizationRecordRepository,
    ImmunizationRecordQueryFilters
} from '@/repositories/immunization-records-repository'

export class ImmunizationRecordService {
    constructor(
        private readonly immunization_record_repository: ImmunizationRecordRepository
    ) {}

    async createImmunizationRecord(
        record_payload: NewImmunizationRecord
    ): Promise<ImmunizationRecord> {
        const isDuplicate =
            await this.immunization_record_repository.existsByUniqueKey(
                record_payload.children_id,
                record_payload.vaccine_id,
                record_payload.dose_number
            )
        if (isDuplicate) {
            throw new Error(
                'Immunization record for this child, vaccine, and dose already exists'
            )
        }

        return this.immunization_record_repository.create(record_payload)
    }

    async getImmunizationRecords(
        query_filters?: ImmunizationRecordQueryFilters
    ) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.immunization_record_repository.getImmunizationRecords(
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

    async getImmunizationRecordById(
        public_id: string
    ): Promise<ImmunizationRecord> {
        const record =
            await this.immunization_record_repository.findById(public_id)
        if (!record) throw new Error('Immunization record not found')
        return record
    }

    async updateImmunizationRecord(
        public_id: string,
        record_payload: Partial<NewImmunizationRecord>
    ): Promise<ImmunizationRecord> {
        const existingRecord = await this.getImmunizationRecordById(public_id)

        const childId = record_payload.children_id ?? existingRecord.children_id
        const vaccineId = record_payload.vaccine_id ?? existingRecord.vaccine_id
        const doseNumber =
            record_payload.dose_number ?? existingRecord.dose_number

        if (
            childId !== existingRecord.children_id ||
            vaccineId !== existingRecord.vaccine_id ||
            doseNumber !== existingRecord.dose_number
        ) {
            const isDuplicate =
                await this.immunization_record_repository.existsByUniqueKey(
                    childId,
                    vaccineId,
                    doseNumber
                )
            if (isDuplicate) {
                throw new Error(
                    'Immunization record with the same child, vaccine, and dose already exists'
                )
            }
        }

        const updated = await this.immunization_record_repository.update(
            public_id,
            record_payload
        )
        if (!updated) throw new Error('Failed to update immunization record')
        return updated
    }

    async deleteImmunizationRecord(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<ImmunizationRecord> {
        await this.getImmunizationRecordById(public_id)

        const deleted = is_permanent
            ? await this.immunization_record_repository.hardDelete(public_id)
            : await this.immunization_record_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete immunization record')
        return deleted
    }

    async restoreImmunizationRecord(
        public_id: string
    ): Promise<ImmunizationRecord> {
        const restored =
            await this.immunization_record_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore immunization record')
        return restored
    }
}
