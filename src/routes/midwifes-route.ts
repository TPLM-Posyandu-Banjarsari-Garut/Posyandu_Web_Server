import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { MidwifeController } from '@/controllers/midwifes-controller'
import { MidwifeService } from '@/services/midwifes-service'
import { MidwifeRepository } from '@/repositories/midwifes-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createMidwifeSchema,
    updateMidwifeSchema,
    getMidwifesQuerySchema,
    midwifeParamsSchema,
    deleteMidwifeQuerySchema
} from '@/validations/midwifes-validation'
import db from '@/configs/db'

const router = Router()

const midwife_repository = new MidwifeRepository(db)
const midwife_service = new MidwifeService(midwife_repository)
const midwife_controller = new MidwifeController(midwife_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife'),
    validateRequest({ body: createMidwifeSchema }),
    AsyncHandler(midwife_controller.createMidwife)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife'),
    validateRequest({ query: getMidwifesQuerySchema }),
    AsyncHandler(midwife_controller.getmidwifes)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife'),
    validateRequest({ params: midwifeParamsSchema }),
    AsyncHandler(midwife_controller.getMidwifeById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife'),
    validateRequest({ params: midwifeParamsSchema, body: updateMidwifeSchema }),
    AsyncHandler(midwife_controller.updateMidwife)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife'),
    validateRequest({
        params: midwifeParamsSchema,
        query: deleteMidwifeQuerySchema
    }),
    AsyncHandler(midwife_controller.deleteMidwife)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'midwife'),
    validateRequest({ params: midwifeParamsSchema }),
    AsyncHandler(midwife_controller.restoreMidwife)
)

export default router
