import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { ExaminationsController } from '@/controllers/examinations-controller'
import { ExaminationsService } from '@/services/examinations-service'
import { ExaminationsRepository } from '@/repositories/examinations-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createExaminationSchema,
    updateExaminationSchema,
    getExaminationsQuerySchema,
    examinationParamsSchema,
    deleteExaminationQuerySchema
} from '@/validations/examinations-validation'
import db from '@/configs/db'

const router = Router()

const repository = new ExaminationsRepository(db)
const service = new ExaminationsService(repository)
const controller = new ExaminationsController(service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ body: createExaminationSchema }),
    AsyncHandler(controller.createExamination)
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
    validateRequest({ query: getExaminationsQuerySchema }),
    AsyncHandler(controller.getExaminations)
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
    validateRequest({ params: examinationParamsSchema }),
    AsyncHandler(controller.getExaminationById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: examinationParamsSchema,
        body: updateExaminationSchema
    }),
    AsyncHandler(controller.updateExamination)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: examinationParamsSchema,
        query: deleteExaminationQuerySchema
    }),
    AsyncHandler(controller.deleteExamination)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: examinationParamsSchema }),
    AsyncHandler(controller.restoreExamination)
)

export default router
