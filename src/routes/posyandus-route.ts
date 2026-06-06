import { Router } from 'express'
import { PosyanduController } from '@/controllers/posyandus-controller'
import { PosyanduService } from '@/services/posyandus-service'
import { PosyanduRepository } from '@/repositories/posyandus-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createPosyanduSchema,
    updatePosyanduSchema,
    getPosyandusQuerySchema,
    posyanduParamsSchema,
    deletePosyanduQuerySchema
} from '@/validations/posyandus-validation'
import db from '@/configs/db'

const router = Router()

const posyandu_repository = new PosyanduRepository(db)
const posyandu_service = new PosyanduService(posyandu_repository)
const posyandu_controller = new PosyanduController(posyandu_service)

router.post(
    '/',
    validateRequest({ body: createPosyanduSchema }),
    AsyncHandler(posyandu_controller.createPosyandu)
)

router.get(
    '/',
    validateRequest({ query: getPosyandusQuerySchema }),
    AsyncHandler(posyandu_controller.getPosyandus)
)

router.get(
    '/:public_id',
    validateRequest({ params: posyanduParamsSchema }),
    AsyncHandler(posyandu_controller.getPosyanduById)
)

router.put(
    '/:public_id',
    validateRequest({
        params: posyanduParamsSchema,
        body: updatePosyanduSchema
    }),
    AsyncHandler(posyandu_controller.updatePosyandu)
)

router.delete(
    '/:public_id',
    validateRequest({
        params: posyanduParamsSchema,
        query: deletePosyanduQuerySchema
    }),
    AsyncHandler(posyandu_controller.deletePosyandu)
)

router.post(
    '/:public_id/restore',
    validateRequest({ params: posyanduParamsSchema }),
    AsyncHandler(posyandu_controller.restorePosyandu)
)

export default router
