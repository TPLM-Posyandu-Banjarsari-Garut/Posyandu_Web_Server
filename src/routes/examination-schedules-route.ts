import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { ExaminationSchedulesController } from '@/controllers/examination-schedules-controller'
import { ExaminationSchedulesService } from '@/services/examination-schedules-service'
import { ExaminationSchedulesRepository } from '@/repositories/examination-schedules-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createExaminationScheduleSchema,
    updateExaminationScheduleSchema,
    getExaminationSchedulesQuerySchema,
    examinationScheduleParamsSchema,
    deleteExaminationScheduleQuerySchema
} from '@/validations/examination-schedules-validation'
import db from '@/configs/db'

const router = Router()

const repository = new ExaminationSchedulesRepository(db)
const service = new ExaminationSchedulesService(repository)
const controller = new ExaminationSchedulesController(service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ body: createExaminationScheduleSchema }),
    AsyncHandler(controller.createSchedule)
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
    validateRequest({ query: getExaminationSchedulesQuerySchema }),
    AsyncHandler(controller.getSchedules)
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
    validateRequest({ params: examinationScheduleParamsSchema }),
    AsyncHandler(controller.getScheduleById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: examinationScheduleParamsSchema,
        body: updateExaminationScheduleSchema
    }),
    AsyncHandler(controller.updateSchedule)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: examinationScheduleParamsSchema,
        query: deleteExaminationScheduleQuerySchema
    }),
    AsyncHandler(controller.deleteSchedule)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: examinationScheduleParamsSchema }),
    AsyncHandler(controller.restoreSchedule)
)

export default router
