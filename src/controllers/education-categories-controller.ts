import { Request, Response } from 'express'
import { EducationCategoryService } from '@/services/education-categories-service'
import { EducationCategoryQueryFilters } from '@/repositories/education-categories-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

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
        return handleGetByIdRequest(
            req,
            res,
            'Category',
            this.categoryService.getCategoryById.bind(this.categoryService)
        )
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
        return handleDeleteRequest(
            req,
            res,
            'Category',
            this.categoryService.deleteCategory.bind(this.categoryService)
        )
    }

    restoreCategory = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'Category',
            this.categoryService.restoreCategory.bind(this.categoryService)
        )
    }
}
