import { createPaginationMeta } from '@/utils/pagination'
import { NewExaminationSchedule, ExaminationSchedule } from '@/db'
import {
    ExaminationSchedulesRepository,
    ExaminationSchedulesQueryFilters
} from '@/repositories/examination-schedules-repository'
import { ApiError } from '@/utils/api-error'

export class ExaminationSchedulesService {
    constructor(
        private readonly schedules_repository: ExaminationSchedulesRepository
    ) {}

    async createSchedule(
        payload: NewExaminationSchedule
    ): Promise<ExaminationSchedule> {
        return this.schedules_repository.create(payload)
    }

    async getSchedules(filters?: ExaminationSchedulesQueryFilters) {
        const { page = 1, limit = 10 } = filters || {}
        const { data, totalItems } =
            await this.schedules_repository.getSchedules(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getScheduleById(id: string): Promise<ExaminationSchedule> {
        const record = await this.schedules_repository.findById(id)
        if (!record) throw ApiError.notFound('Examination schedule not found')
        return record
    }

    async updateSchedule(
        id: string,
        payload: Partial<NewExaminationSchedule>
    ): Promise<ExaminationSchedule> {
        await this.getScheduleById(id)
        const updated = await this.schedules_repository.update(id, payload)
        if (!updated)
            throw ApiError.server('Failed to update examination schedule')
        return updated
    }

    async deleteSchedule(
        id: string,
        isPermanent = false
    ): Promise<ExaminationSchedule> {
        await this.getScheduleById(id)
        const deleted = isPermanent
            ? await this.schedules_repository.hardDelete(id)
            : await this.schedules_repository.softDelete(id)

        if (!deleted)
            throw ApiError.server('Failed to delete examination schedule')
        return deleted
    }

    async restoreSchedule(id: string): Promise<ExaminationSchedule> {
        const restored = await this.schedules_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore examination schedule')
        return restored
    }
}
