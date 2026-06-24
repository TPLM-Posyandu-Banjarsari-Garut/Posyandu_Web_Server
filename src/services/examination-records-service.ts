import { createPaginationMeta } from '@/utils/pagination'
import { NewExaminationRecord, ExaminationRecord } from '@/db'
import {
    ExaminationRecordsRepository,
    ExaminationRecordsQueryFilters
} from '@/repositories/examination-records-repository'
import { ExaminationSchedulesRepository } from '@/repositories/examination-schedules-repository'
import { ApiError } from '@/utils/api-error'

export class ExaminationRecordsService {
    constructor(
        private readonly records_repository: ExaminationRecordsRepository,
        private readonly schedules_repository: ExaminationSchedulesRepository
    ) {}

    async createRecord(
        payload: NewExaminationRecord
    ): Promise<ExaminationRecord> {
        const examDate = new Date(payload.examination_date)
        const now = new Date()
        const startOfToday = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                0,
                0,
                0,
                0
            )
        )
        const endOfLusa = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + 2,
                23,
                59,
                59,
                999
            )
        )

        if (
            examDate.getTime() < startOfToday.getTime() ||
            examDate.getTime() > endOfLusa.getTime()
        ) {
            throw ApiError.badRequest(
                'Booking is only allowed for today, tomorrow, and the day after tomorrow'
            )
        }

        if (payload.schedule_id) {
            const schedule = await this.schedules_repository.findById(
                payload.schedule_id
            )
            if (!schedule) {
                throw ApiError.notFound(
                    'Associated examination schedule not found'
                )
            }
            if (schedule.status === 'cancelled') {
                throw ApiError.badRequest(
                    'Cannot book an examination for a cancelled schedule'
                )
            }
            const existing = await this.records_repository.getRecords({
                schedule_id: payload.schedule_id,
                children_id: payload.children_id || undefined,
                parent_id: payload.parent_id || undefined,
                limit: 1
            })
            if (existing.data.length > 0) {
                throw ApiError.badRequest(
                    'You or your child has already registered for this examination schedule'
                )
            }

            if (
                schedule.max_participants &&
                schedule.current_participants >= schedule.max_participants
            ) {
                throw ApiError.badRequest(
                    'The selected examination schedule is already full'
                )
            }
            await this.schedules_repository.incrementParticipants(
                payload.schedule_id
            )
        }

        return this.records_repository.create(payload)
    }

    async getRecords(filters?: ExaminationRecordsQueryFilters) {
        const { page = 1, limit = 10 } = filters || {}
        const { data, totalItems } =
            await this.records_repository.getRecords(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getRecordById(id: string): Promise<ExaminationRecord> {
        const record = await this.records_repository.findById(id)
        if (!record) throw ApiError.notFound('Examination record not found')
        return record
    }

    async updateRecord(
        id: string,
        payload: Partial<NewExaminationRecord>
    ): Promise<ExaminationRecord> {
        await this.getRecordById(id)
        const updated = await this.records_repository.update(id, payload)
        if (!updated)
            throw ApiError.server('Failed to update examination record')
        return updated
    }

    async deleteRecord(
        id: string,
        isPermanent = false
    ): Promise<ExaminationRecord> {
        const record = await this.getRecordById(id)
        const deleted = isPermanent
            ? await this.records_repository.hardDelete(id)
            : await this.records_repository.softDelete(id)

        if (!deleted)
            throw ApiError.server('Failed to delete examination record')

        if (record.schedule_id) {
            await this.schedules_repository.decrementParticipants(
                record.schedule_id
            )
        }

        return deleted
    }

    async restoreRecord(id: string): Promise<ExaminationRecord> {
        const restored = await this.records_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore examination record')

        if (restored.schedule_id) {
            await this.schedules_repository.incrementParticipants(
                restored.schedule_id
            )
        }

        return restored
    }
}
