import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { ExaminationRecordsController } from '@/controllers/examination-records-controller'
import { ExaminationRecordsService } from '@/services/examination-records-service'
import { ExaminationRecordsRepository } from '@/repositories/examination-records-repository'
import { ExaminationSchedulesRepository } from '@/repositories/examination-schedules-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createExaminationRecordSchema,
    updateExaminationRecordSchema,
    getExaminationRecordsQuerySchema,
    examinationRecordParamsSchema,
    deleteExaminationRecordQuerySchema
} from '@/validations/examination-records-validation'
import db from '@/configs/db'

const router = Router()

const recordsRepository = new ExaminationRecordsRepository(db)
const schedulesRepository = new ExaminationSchedulesRepository(db)
const service = new ExaminationRecordsService(
    recordsRepository,
    schedulesRepository
)
const controller = new ExaminationRecordsController(service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ body: createExaminationRecordSchema }),
    AsyncHandler(controller.createRecord)
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
    validateRequest({ query: getExaminationRecordsQuerySchema }),
    AsyncHandler(controller.getRecords)
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
    validateRequest({ params: examinationRecordParamsSchema }),
    AsyncHandler(controller.getRecordById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: examinationRecordParamsSchema,
        body: updateExaminationRecordSchema
    }),
    AsyncHandler(controller.updateRecord)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: examinationRecordParamsSchema,
        query: deleteExaminationRecordQuerySchema
    }),
    AsyncHandler(controller.deleteRecord)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: examinationRecordParamsSchema }),
    AsyncHandler(controller.restoreRecord)
)

export default router
