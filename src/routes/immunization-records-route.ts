import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { ImmunizationRecordController } from '@/controllers/immunization-records-controller'
import { ImmunizationRecordService } from '@/services/immunization-records-service'
import { ImmunizationRecordRepository } from '@/repositories/immunization-records-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createImmunizationRecordSchema,
    updateImmunizationRecordSchema,
    getImmunizationRecordsQuerySchema,
    immunizationRecordParamsSchema,
    deleteImmunizationRecordQuerySchema
} from '@/validations/immunization-records-validation'
import db from '@/configs/db'

const router = Router()

const immunization_record_repository = new ImmunizationRecordRepository(db)
const immunization_record_service = new ImmunizationRecordService(
    immunization_record_repository
)
const immunization_record_controller = new ImmunizationRecordController(
    immunization_record_service
)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ body: createImmunizationRecordSchema }),
    AsyncHandler(immunization_record_controller.createImmunizationRecord)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ query: getImmunizationRecordsQuerySchema }),
    AsyncHandler(immunization_record_controller.getImmunizationRecords)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ params: immunizationRecordParamsSchema }),
    AsyncHandler(immunization_record_controller.getImmunizationRecordById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: immunizationRecordParamsSchema,
        body: updateImmunizationRecordSchema
    }),
    AsyncHandler(immunization_record_controller.updateImmunizationRecord)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: immunizationRecordParamsSchema,
        query: deleteImmunizationRecordQuerySchema
    }),
    AsyncHandler(immunization_record_controller.deleteImmunizationRecord)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ params: immunizationRecordParamsSchema }),
    AsyncHandler(immunization_record_controller.restoreImmunizationRecord)
)

export default router
