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
        // Check if slug or name already exists
        const existingCategory = await this.categoryRepository.findBySlug(
            payload.slug
        )
        if (existingCategory) {
            throw new Error('Category with this slug already exists')
        }

        return this.categoryRepository.create(payload)
    }

    async getCategories(queryFilters?: EducationCategoryQueryFilters) {
        const { page = 1, limit = 10 } = queryFilters || {}
        const { data, totalItems } =
            await this.categoryRepository.getCategories(queryFilters)

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

    async getCategoryById(public_id: string): Promise<EducationCategory> {
        const category = await this.categoryRepository.findById(public_id)
        if (!category) throw new Error('Education category not found')
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
                throw new Error('Category with this slug already exists')
            }
        }

        const updated = await this.categoryRepository.update(public_id, payload)
        if (!updated) throw new Error('Failed to update education category')
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

        if (!deleted) throw new Error('Failed to delete education category')
        return deleted
    }

    async restoreCategory(public_id: string): Promise<EducationCategory> {
        const restored = await this.categoryRepository.restore(public_id)
        if (!restored) throw new Error('Failed to restore education category')
        return restored
    }
}
