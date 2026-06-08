import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { ParentController } from '@/controllers/parents-controller'
import { ParentService } from '@/services/parents-service'
import { ParentRepository } from '@/repositories/parents-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createParentSchema,
    updateParentSchema,
    getParentsQuerySchema,
    parentParamsSchema,
    deleteParentQuerySchema
} from '@/validations/parents-validation'
import db from '@/configs/db'

const router = Router()

const parent_repository = new ParentRepository(db)
const parent_service = new ParentService(parent_repository)
const parent_controller = new ParentController(parent_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({ body: createParentSchema }),
    AsyncHandler(parent_controller.createParent)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({ query: getParentsQuerySchema }),
    AsyncHandler(parent_controller.getParents)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({ params: parentParamsSchema }),
    AsyncHandler(parent_controller.getParentById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({ params: parentParamsSchema, body: updateParentSchema }),
    AsyncHandler(parent_controller.updateParent)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({
        params: parentParamsSchema,
        query: deleteParentQuerySchema
    }),
    AsyncHandler(parent_controller.deleteParent)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({ params: parentParamsSchema }),
    AsyncHandler(parent_controller.restoreParent)
)

export default router
