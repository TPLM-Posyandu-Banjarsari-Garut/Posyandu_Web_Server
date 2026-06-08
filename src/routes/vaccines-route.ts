import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { VaccineController } from '@/controllers/vaccines-controller'
import { VaccineService } from '@/services/vaccines-service'
import { VaccineRepository } from '@/repositories/vaccines-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createVaccineSchema,
    updateVaccineSchema,
    getVaccinesQuerySchema,
    vaccineParamsSchema,
    deleteVaccineQuerySchema
} from '@/validations/vaccines-validation'
import db from '@/configs/db'

const router = Router()

const vaccine_repository = new VaccineRepository(db)
const vaccine_service = new VaccineService(vaccine_repository)
const vaccine_controller = new VaccineController(vaccine_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ body: createVaccineSchema }),
    AsyncHandler(vaccine_controller.createVaccine)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ query: getVaccinesQuerySchema }),
    AsyncHandler(vaccine_controller.getVaccines)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ params: vaccineParamsSchema }),
    AsyncHandler(vaccine_controller.getVaccineById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: vaccineParamsSchema,
        body: updateVaccineSchema
    }),
    AsyncHandler(vaccine_controller.updateVaccine)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: vaccineParamsSchema,
        query: deleteVaccineQuerySchema
    }),
    AsyncHandler(vaccine_controller.deleteVaccine)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ params: vaccineParamsSchema }),
    AsyncHandler(vaccine_controller.restoreVaccine)
)

export default router
