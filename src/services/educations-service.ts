import { createPaginationMeta } from '@/utils/pagination'
import { NewEducation, Education } from '@/db'
import {
    EducationRepository,
    EducationQueryFilters
} from '@/repositories/educations-repository'
import { EducationCategoryRepository } from '@/repositories/education-categories-repository'

export class EducationService {
    constructor(
        private readonly educationRepository: EducationRepository,
        private readonly categoryRepository: EducationCategoryRepository
    ) {}

    async createEducation(payload: NewEducation): Promise<Education> {
        // Validate category exists
        const category = await this.categoryRepository.findById(
            payload.category_id
        )
        if (!category) {
            throw new Error('Education category not found')
        }

        return this.educationRepository.create(payload)
    }

    async getEducations(queryFilters?: EducationQueryFilters) {
        const { page = 1, limit = 10 } = queryFilters || {}
        const { data, totalItems } =
            await this.educationRepository.getEducations(queryFilters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getEducationById(
        public_id: string,
        incrementView: boolean = false
    ): Promise<Education> {
        if (incrementView) {
            await this.educationRepository.incrementViews(public_id)
        }
        const education = await this.educationRepository.findById(public_id)
        if (!education) throw new Error('Education article not found')
        return education
    }

    async updateEducation(
        public_id: string,
        payload: Partial<NewEducation>
    ): Promise<Education> {
        await this.getEducationById(public_id)

        if (payload.category_id) {
            const category = await this.categoryRepository.findById(
                payload.category_id
            )
            if (!category) {
                throw new Error('Education category not found')
            }
        }

        const updated = await this.educationRepository.update(
            public_id,
            payload
        )
        if (!updated) throw new Error('Failed to update education article')
        return updated
    }

    async deleteEducation(
        public_id: string,
        isPermanent: boolean = false
    ): Promise<Education> {
        const existing = await this.educationRepository.findById(
            public_id,
            true
        )
        if (!existing) throw new Error('Education article not found')

        if (!isPermanent && existing.status === 'inactive') {
            return existing
        }

        const deleted = isPermanent
            ? await this.educationRepository.hardDelete(public_id)
            : await this.educationRepository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete education article')
        return deleted
    }

    async restoreEducation(public_id: string): Promise<Education> {
        const restored = await this.educationRepository.restore(public_id)
        if (!restored) throw new Error('Failed to restore education article')
        return restored
    }
}
