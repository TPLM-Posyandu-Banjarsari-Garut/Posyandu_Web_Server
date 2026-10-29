import { createPaginationMeta } from '@/utils/pagination'
import { NewExamination, Examination } from '@/db'
import {
    ExaminationsRepository,
    ExaminationsQueryFilters
} from '@/repositories/examinations-repository'
import { ApiError } from '@/utils/api-error'
import { cacheGetOrLoad, invalidateCache } from '@/utils/cloudflare-cache'

export class ExaminationsService {
    constructor(
        private readonly examinations_repository: ExaminationsRepository
    ) {}

    async createExamination(payload: NewExamination): Promise<Examination> {
        const created = await this.examinations_repository.create(payload)
        await invalidateCache('examinations')
        return created
    }

    async getExaminations(filters?: ExaminationsQueryFilters) {
        const { page = 1, limit = 10 } = filters || {}
        return cacheGetOrLoad(
            'examinations',
            { type: 'list', filters },
            180,
            async () => {
                const { data, totalItems } =
                    await this.examinations_repository.getExaminations(filters)
                return {
                    data,
                    meta: createPaginationMeta(page, limit, totalItems)
                }
            }
        )
    }

    async getExaminationById(id: string): Promise<Examination> {
        const record = await cacheGetOrLoad(
            'examinations',
            { type: 'item', id },
            180,
            () => this.examinations_repository.findById(id)
        )
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
        await invalidateCache('examinations')
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
        await invalidateCache('examinations')
        return deleted
    }

    async restoreExamination(id: string): Promise<Examination> {
        const restored = await this.examinations_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore examination template')
        await invalidateCache('examinations')
        return restored
    }
}
