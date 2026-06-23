import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { EducationController } from '@/controllers/educations-controller'
import { EducationService } from '@/services/educations-service'
import { EducationRepository } from '@/repositories/educations-repository'
import { EducationCategoryRepository } from '@/repositories/education-categories-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createEducationSchema,
    updateEducationSchema,
    getEducationsQuerySchema,
    educationParamsSchema,
    deleteEducationQuerySchema
} from '@/validations/educations-validation'
import db from '@/configs/db'

const router = Router()

const educationRepository = new EducationRepository(db)
const categoryRepository = new EducationCategoryRepository(db)
const educationService = new EducationService(
    educationRepository,
    categoryRepository
)
const educationController = new EducationController(educationService)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    (req, res, next) => {
        if (res.locals.user) {
            req.body.created_by_user_id = res.locals.user.id
        }
        next()
    },
    validateRequest({ body: createEducationSchema }),
    AsyncHandler(educationController.createEducation)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles(
        'posyandu_admin',
        'village_admin',
        'midwife',
        'cadre',
        'parent'
    ),
    validateRequest({ query: getEducationsQuerySchema }),
    AsyncHandler(educationController.getEducations)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles(
        'posyandu_admin',
        'village_admin',
        'midwife',
        'cadre',
        'parent'
    ),
    validateRequest({ params: educationParamsSchema }),
    AsyncHandler(educationController.getEducationById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: educationParamsSchema,
        body: updateEducationSchema
    }),
    AsyncHandler(educationController.updateEducation)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: educationParamsSchema,
        query: deleteEducationQuerySchema
    }),
    AsyncHandler(educationController.deleteEducation)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: educationParamsSchema }),
    AsyncHandler(educationController.restoreEducation)
)

export default router
