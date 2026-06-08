import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { NutritionRecordController } from '@/controllers/nutrition-records-controller'
import { NutritionRecordService } from '@/services/nutrition-records-service'
import { NutritionRecordRepository } from '@/repositories/nutrition-records-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createNutritionRecordSchema,
    updateNutritionRecordSchema,
    getNutritionRecordsQuerySchema,
    nutritionRecordParamsSchema,
    deleteNutritionRecordQuerySchema
} from '@/validations/nutrition-records-validation'
import db from '@/configs/db'

const router = Router()

const nutrition_record_repository = new NutritionRecordRepository(db)
const nutrition_record_service = new NutritionRecordService(
    nutrition_record_repository
)
const nutrition_record_controller = new NutritionRecordController(
    nutrition_record_service
)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ body: createNutritionRecordSchema }),
    AsyncHandler(nutrition_record_controller.createNutritionRecord)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ query: getNutritionRecordsQuerySchema }),
    AsyncHandler(nutrition_record_controller.getNutritionRecords)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ params: nutritionRecordParamsSchema }),
    AsyncHandler(nutrition_record_controller.getNutritionRecordById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: nutritionRecordParamsSchema,
        body: updateNutritionRecordSchema
    }),
    AsyncHandler(nutrition_record_controller.updateNutritionRecord)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: nutritionRecordParamsSchema,
        query: deleteNutritionRecordQuerySchema
    }),
    AsyncHandler(nutrition_record_controller.deleteNutritionRecord)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ params: nutritionRecordParamsSchema }),
    AsyncHandler(nutrition_record_controller.restoreNutritionRecord)
)

export default router
