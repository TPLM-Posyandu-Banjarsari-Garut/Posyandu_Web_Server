import { createPaginationMeta } from '@/utils/pagination'
import { NewExamination, Examination } from '@/db'
import {
    ExaminationsRepository,
    ExaminationsQueryFilters
} from '@/repositories/examinations-repository'
import { ApiError } from '@/utils/api-error'

export class ExaminationsService {
    constructor(
        private readonly examinations_repository: ExaminationsRepository
    ) {}

    async createExamination(payload: NewExamination): Promise<Examination> {
        return this.examinations_repository.create(payload)
    }

    async getExaminations(filters?: ExaminationsQueryFilters) {
        const { page = 1, limit = 10 } = filters || {}
        const { data, totalItems } =
            await this.examinations_repository.getExaminations(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getExaminationById(id: string): Promise<Examination> {
        const record = await this.examinations_repository.findById(id)
        if (!record) throw ApiError.notFound('Examination template not found')
        return record
    }

    async updateExamination(
        id: string,
        payload: Partial<NewExamination>
    ): Promise<Examination> {
        await this.getExaminationById(id)
        const updated = await this.examinations_repository.update(id, payload)
        if (!updated)
            throw ApiError.server('Failed to update examination template')
        return updated
    }

    async deleteExamination(
        id: string,
        isPermanent = false
    ): Promise<Examination> {
        await this.getExaminationById(id)
        const deleted = isPermanent
            ? await this.examinations_repository.hardDelete(id)
            : await this.examinations_repository.softDelete(id)

        if (!deleted)
            throw ApiError.server('Failed to delete examination template')
        return deleted
    }

    async restoreExamination(id: string): Promise<Examination> {
        const restored = await this.examinations_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore examination template')
        return restored
    }
}
