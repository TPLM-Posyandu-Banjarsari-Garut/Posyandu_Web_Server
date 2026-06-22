import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { TrashController } from '@/controllers/trash-controller'
import { TrashService } from '@/services/trash-service'
import { TrashRepository } from '@/repositories/trash-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    getTrashQuerySchema,
    restoreParamsSchema
} from '@/validations/trash-validation'
import db from '@/configs/db'

const router = Router()

const trashRepository = new TrashRepository(db)
const trashService = new TrashService(trashRepository)
const trashController = new TrashController(trashService)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin'),
    validateRequest({ query: getTrashQuerySchema }),
    AsyncHandler(trashController.getTrash)
)

router.post(
    '/:type/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin'),
    validateRequest({ params: restoreParamsSchema }),
    AsyncHandler(trashController.restoreItem)
)

export default router
