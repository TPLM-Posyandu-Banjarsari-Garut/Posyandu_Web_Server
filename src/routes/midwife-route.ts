import { Router } from 'express'
import { MidwifeController } from '@/controllers/midwife-controller'
import { MidwifeService } from '@/services/midwife-service'
import { MidwifeRepository } from '@/repositories/midwife-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createMidwifeSchema,
    updateMidwifeSchema,
    getMidwifesQuerySchema,
    midwifeParamsSchema
} from '@/validations/midwife-validation'
import db from '@/configs/db'

const router = Router()

const midwife_repository = new MidwifeRepository(db)
const midwife_service = new MidwifeService(midwife_repository)
const midwife_controller = new MidwifeController(midwife_service)

router.post(
    '/',
    validateRequest({ body: createMidwifeSchema }),
    AsyncHandler(midwife_controller.createMidwife)
)

router.get(
    '/',
    validateRequest({ query: getMidwifesQuerySchema }),
    AsyncHandler(midwife_controller.getMidwifes)
)

router.get(
    '/:public_id',
    validateRequest({ params: midwifeParamsSchema }),
    AsyncHandler(midwife_controller.getMidwifeById)
)

router.put(
    '/:public_id',
    validateRequest({ params: midwifeParamsSchema, body: updateMidwifeSchema }),
    AsyncHandler(midwife_controller.updateMidwife)
)

router.delete(
    '/:public_id',
    validateRequest({ params: midwifeParamsSchema }),
    AsyncHandler(midwife_controller.deleteMidwife)
)

export default router
