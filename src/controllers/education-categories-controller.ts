import { Request, Response } from 'express'
import { EducationCategoryService } from '@/services/education-categories-service'
import { EducationCategoryQueryFilters } from '@/repositories/education-categories-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class EducationCategoryController {
    constructor(private readonly categoryService: EducationCategoryService) {}

    createCategory = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Category')

        const category = await this.categoryService.createCategory(req.body)

        logger.info(
            { categoryId: category.id },
            'Category created successfully'
        )
        return ApiResponse.created(
            res,
            'Category created successfully',
            category
        )
    }

    getCategories = async (req: Request, res: Response) => {
        const query = req.query as unknown as EducationCategoryQueryFilters
        logger.info({ query }, 'Incoming request: Get Categories')

        const result = await this.categoryService.getCategories(query)
        return ApiResponse.ok(res, 'Categories retrieved successfully', result)
    }

    getCategoryById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Category By ID')

        const category = await this.categoryService.getCategoryById(public_id)
        return ApiResponse.ok(res, 'Category retrieved successfully', category)
    }

    updateCategory = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Category'
        )

        const category = await this.categoryService.updateCategory(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Category updated successfully', category)
    }

    deleteCategory = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const isPermanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, isPermanent },
            'Incoming request: Delete Category'
        )

        const category = await this.categoryService.deleteCategory(
            public_id,
            isPermanent
        )
        return ApiResponse.ok(res, 'Category deleted successfully', category)
    }

    restoreCategory = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Category')

        const category = await this.categoryService.restoreCategory(public_id)
        return ApiResponse.ok(res, 'Category restored successfully', category)
    }
}
