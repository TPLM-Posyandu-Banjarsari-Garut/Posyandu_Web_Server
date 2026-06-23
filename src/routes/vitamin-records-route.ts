import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { VitaminRecordController } from '@/controllers/vitamin-records-controller'
import { VitaminRecordService } from '@/services/vitamin-records-service'
import { VitaminRecordRepository } from '@/repositories/vitamin-records-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createVitaminRecordSchema,
    updateVitaminRecordSchema,
    getVitaminRecordsQuerySchema,
    vitaminRecordParamsSchema,
    deleteVitaminRecordQuerySchema
} from '@/validations/vitamin-records-validation'
import db from '@/configs/db'

const router = Router()

const vitamin_record_repository = new VitaminRecordRepository(db)
const vitamin_record_service = new VitaminRecordService(
    vitamin_record_repository
)
const vitamin_record_controller = new VitaminRecordController(
    vitamin_record_service
)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ body: createVitaminRecordSchema }),
    AsyncHandler(vitamin_record_controller.createVitaminRecord)
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
    validateRequest({ query: getVitaminRecordsQuerySchema }),
    AsyncHandler(vitamin_record_controller.getVitaminRecords)
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
    validateRequest({ params: vitaminRecordParamsSchema }),
    AsyncHandler(vitamin_record_controller.getVitaminRecordById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: vitaminRecordParamsSchema,
        body: updateVitaminRecordSchema
    }),
    AsyncHandler(vitamin_record_controller.updateVitaminRecord)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: vitaminRecordParamsSchema,
        query: deleteVitaminRecordQuerySchema
    }),
    AsyncHandler(vitamin_record_controller.deleteVitaminRecord)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: vitaminRecordParamsSchema }),
    AsyncHandler(vitamin_record_controller.restoreVitaminRecord)
)

export default router
