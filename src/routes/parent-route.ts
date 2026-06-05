import { Router } from 'express'
import { ParentController } from '@/controllers/parent-controller'
import { ParentService } from '@/services/parent-service'
import { ParentRepository } from '@/repositories/parents-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createParentSchema,
    updateParentSchema,
    getParentsQuerySchema,
    parentParamsSchema,
    deleteParentQuerySchema
} from '@/validations/parent-validation'
import db from '@/configs/db'

const router = Router()

const parent_repository = new ParentRepository(db)
const parent_service = new ParentService(parent_repository)
const parent_controller = new ParentController(parent_service)

router.post(
    '/',
    validateRequest({ body: createParentSchema }),
    AsyncHandler(parent_controller.createParent)
)

router.get(
    '/',
    validateRequest({ query: getParentsQuerySchema }),
    AsyncHandler(parent_controller.getParents)
)

router.get(
    '/:public_id',
    validateRequest({ params: parentParamsSchema }),
    AsyncHandler(parent_controller.getParentById)
)

router.put(
    '/:public_id',
    validateRequest({ params: parentParamsSchema, body: updateParentSchema }),
    AsyncHandler(parent_controller.updateParent)
)

router.delete(
    '/:public_id',
    validateRequest({
        params: parentParamsSchema,
        query: deleteParentQuerySchema
    }),
    AsyncHandler(parent_controller.deleteParent)
)

router.post(
    '/:public_id/restore',
    validateRequest({ params: parentParamsSchema }),
    AsyncHandler(parent_controller.restoreParent)
)

export default router
