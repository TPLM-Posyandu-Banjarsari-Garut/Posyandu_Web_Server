import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { VitaminController } from '@/controllers/vitamins-controller'
import { VitaminService } from '@/services/vitamins-service'
import { VitaminRepository } from '@/repositories/vitamins-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createVitaminSchema,
    updateVitaminSchema,
    getVitaminsQuerySchema,
    vitaminParamsSchema,
    deleteVitaminQuerySchema
} from '@/validations/vitamins-validation'
import db from '@/configs/db'

const router = Router()

const vitamin_repository = new VitaminRepository(db)
const vitamin_service = new VitaminService(vitamin_repository)
const vitamin_controller = new VitaminController(vitamin_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ body: createVitaminSchema }),
    AsyncHandler(vitamin_controller.createVitamin)
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
    validateRequest({ query: getVitaminsQuerySchema }),
    AsyncHandler(vitamin_controller.getVitamins)
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
    validateRequest({ params: vitaminParamsSchema }),
    AsyncHandler(vitamin_controller.getVitaminById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: vitaminParamsSchema,
        body: updateVitaminSchema
    }),
    AsyncHandler(vitamin_controller.updateVitamin)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: vitaminParamsSchema,
        query: deleteVitaminQuerySchema
    }),
    AsyncHandler(vitamin_controller.deleteVitamin)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: vitaminParamsSchema }),
    AsyncHandler(vitamin_controller.restoreVitamin)
)

export default router
