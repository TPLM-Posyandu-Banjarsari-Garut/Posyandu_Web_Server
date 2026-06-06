import { Router } from 'express'
import { HealthCenterController } from '@/controllers/health-centers-controller'
import { HealthCenterService } from '@/services/health-centers-service'
import { HealthCenterRepository } from '@/repositories/health-centers-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createHealthCenterSchema,
    updateHealthCenterSchema,
    getHealthCentersQuerySchema,
    healthCenterParamsSchema,
    deleteHealthCenterQuerySchema
} from '@/validations/health-centers-validation'
import db from '@/configs/db'

const router = Router()

const health_center_repository = new HealthCenterRepository(db)
const health_center_service = new HealthCenterService(health_center_repository)
const health_center_controller = new HealthCenterController(
    health_center_service
)

router.post(
    '/',
    validateRequest({ body: createHealthCenterSchema }),
    AsyncHandler(health_center_controller.createHealthCenter)
)

router.get(
    '/',
    validateRequest({ query: getHealthCentersQuerySchema }),
    AsyncHandler(health_center_controller.getHealthCenters)
)

router.get(
    '/:public_id',
    validateRequest({ params: healthCenterParamsSchema }),
    AsyncHandler(health_center_controller.getHealthCenterById)
)

router.put(
    '/:public_id',
    validateRequest({
        params: healthCenterParamsSchema,
        body: updateHealthCenterSchema
    }),
    AsyncHandler(health_center_controller.updateHealthCenter)
)

router.delete(
    '/:public_id',
    validateRequest({
        params: healthCenterParamsSchema,
        query: deleteHealthCenterQuerySchema
    }),
    AsyncHandler(health_center_controller.deleteHealthCenter)
)

router.post(
    '/:public_id/restore',
    validateRequest({ params: healthCenterParamsSchema }),
    AsyncHandler(health_center_controller.restoreHealthCenter)
)

export default router
