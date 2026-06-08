import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { EducationCategoryController } from '@/controllers/education-categories-controller'
import { EducationCategoryService } from '@/services/education-categories-service'
import { EducationCategoryRepository } from '@/repositories/education-categories-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createEducationCategorySchema,
    updateEducationCategorySchema,
    getEducationCategoriesQuerySchema,
    educationCategoryParamsSchema,
    deleteEducationCategoryQuerySchema
} from '@/validations/education-categories-validation'
import db from '@/configs/db'

const router = Router()

const categoryRepository = new EducationCategoryRepository(db)
const categoryService = new EducationCategoryService(categoryRepository)
const categoryController = new EducationCategoryController(categoryService)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ body: createEducationCategorySchema }),
    AsyncHandler(categoryController.createCategory)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ query: getEducationCategoriesQuerySchema }),
    AsyncHandler(categoryController.getCategories)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ params: educationCategoryParamsSchema }),
    AsyncHandler(categoryController.getCategoryById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: educationCategoryParamsSchema,
        body: updateEducationCategorySchema
    }),
    AsyncHandler(categoryController.updateCategory)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: educationCategoryParamsSchema,
        query: deleteEducationCategoryQuerySchema
    }),
    AsyncHandler(categoryController.deleteCategory)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ params: educationCategoryParamsSchema }),
    AsyncHandler(categoryController.restoreCategory)
)

export default router
