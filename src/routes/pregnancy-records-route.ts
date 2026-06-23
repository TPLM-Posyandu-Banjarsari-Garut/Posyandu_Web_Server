import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { PregnancyRecordsController } from '@/controllers/pregnancy-records-controller'
import { PregnancyRecordsService } from '@/services/pregnancy-records-service'
import { PregnancyRecordsRepository } from '@/repositories/pregnancy-records-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createPregnancyRecordSchema,
    updatePregnancyRecordSchema,
    getPregnancyRecordsQuerySchema,
    pregnancyRecordParamsSchema,
    deletePregnancyRecordQuerySchema
} from '@/validations/pregnancy-records-validation'
import db from '@/configs/db'

const router = Router()

const repository = new PregnancyRecordsRepository(db)
const service = new PregnancyRecordsService(repository)
const controller = new PregnancyRecordsController(service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ body: createPregnancyRecordSchema }),
    AsyncHandler(controller.createPregnancyRecord)
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
    validateRequest({ query: getPregnancyRecordsQuerySchema }),
    AsyncHandler(controller.getPregnancyRecords)
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
    validateRequest({ params: pregnancyRecordParamsSchema }),
    AsyncHandler(controller.getPregnancyRecordById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: pregnancyRecordParamsSchema,
        body: updatePregnancyRecordSchema
    }),
    AsyncHandler(controller.updatePregnancyRecord)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: pregnancyRecordParamsSchema,
        query: deletePregnancyRecordQuerySchema
    }),
    AsyncHandler(controller.deletePregnancyRecord)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: pregnancyRecordParamsSchema }),
    AsyncHandler(controller.restorePregnancyRecord)
)

export default router
