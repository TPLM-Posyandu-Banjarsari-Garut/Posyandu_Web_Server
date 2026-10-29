import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { cacheGetOrLoad, invalidateCache } from '@/utils/cloudflare-cache'
import { NewEducationCategory, EducationCategory } from '@/db'
import {
    EducationCategoryRepository,
    EducationCategoryQueryFilters
} from '@/repositories/education-categories-repository'

export class EducationCategoryService {
    constructor(
        private readonly categoryRepository: EducationCategoryRepository
    ) {}

    async createCategory(
        payload: NewEducationCategory
    ): Promise<EducationCategory> {
        const existingCategory = await this.categoryRepository.findBySlug(
            payload.slug
        )
        if (existingCategory) {
            throw ApiError.conflict('Category with this slug already exists')
        }

        const created = await this.categoryRepository.create(payload)
        await invalidateCache('education-categories')
        await invalidateCache('educations')
        return created
    }

    async getCategories(queryFilters?: EducationCategoryQueryFilters) {
        const { page = 1, limit = 10 } = queryFilters || {}
        return cacheGetOrLoad(
            'education-categories',
            { type: 'list', filters: queryFilters },
            300,
            async () => {
                const { data, totalItems } =
                    await this.categoryRepository.getCategories(queryFilters)
                return {
                    data,
                    meta: createPaginationMeta(page, limit, totalItems)
                }
            }
        )
    }

    async getCategoryById(public_id: string): Promise<EducationCategory> {
        const category = await cacheGetOrLoad(
            'education-categories',
            { type: 'item', id: public_id },
            300,
            () => this.categoryRepository.findById(public_id)
        )
        if (!category) throw ApiError.notFound('Education category not found')
        return category
    }

    async updateCategory(
        public_id: string,
        payload: Partial<NewEducationCategory>
    ): Promise<EducationCategory> {
        await this.getCategoryById(public_id)

        if (payload.slug) {
            const existingCategory = await this.categoryRepository.findBySlug(
                payload.slug
            )
            if (existingCategory && existingCategory.id !== public_id) {
                throw ApiError.conflict(
                    'Category with this slug already exists'
                )
            }
        }

        const updated = await this.categoryRepository.update(public_id, payload)
        if (!updated)
            throw ApiError.badRequest('Failed to update education category')
        await invalidateCache('education-categories')
        await invalidateCache('educations')
        return updated
    }

    async deleteCategory(
        public_id: string,
        isPermanent: boolean = false
    ): Promise<EducationCategory> {
        await this.getCategoryById(public_id)

        const deleted = isPermanent
            ? await this.categoryRepository.hardDelete(public_id)
            : await this.categoryRepository.softDelete(public_id)

        if (!deleted)
            throw ApiError.badRequest('Failed to delete education category')
        await invalidateCache('education-categories')
        await invalidateCache('educations')
        return deleted
    }

    async restoreCategory(public_id: string): Promise<EducationCategory> {
        const restored = await this.categoryRepository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore education category')
        await invalidateCache('education-categories')
        await invalidateCache('educations')
        return restored
    }
}
