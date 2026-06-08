import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { ChildrenController } from '@/controllers/childrens-controller'
import { ChildrenService } from '@/services/childrens-service'
import { ChildrenRepository } from '@/repositories/childrens-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createChildSchema,
    updateChildSchema,
    getChildrenQuerySchema,
    childParamsSchema,
    deleteChildQuerySchema
} from '@/validations/childrens-validation'
import db from '@/configs/db'

const router = Router()

const children_repository = new ChildrenRepository(db)
const children_service = new ChildrenService(children_repository)
const children_controller = new ChildrenController(children_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'parent', 'cadre', 'midwife'),
    validateRequest({ body: createChildSchema }),
    AsyncHandler(children_controller.createChildren)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'parent', 'cadre', 'midwife'),
    validateRequest({ query: getChildrenQuerySchema }),
    AsyncHandler(children_controller.getChildrens)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent', 'cadre', 'midwife'),
    validateRequest({ params: childParamsSchema }),
    AsyncHandler(children_controller.getChildrenById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent', 'cadre', 'midwife'),
    validateRequest({
        params: childParamsSchema,
        body: updateChildSchema
    }),
    AsyncHandler(children_controller.updateChildren)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent', 'cadre', 'midwife'),
    validateRequest({
        params: childParamsSchema,
        query: deleteChildQuerySchema
    }),
    AsyncHandler(children_controller.deleteChildren)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'parent', 'cadre', 'midwife'),
    validateRequest({ params: childParamsSchema }),
    AsyncHandler(children_controller.restoreChildren)
)

export default router
