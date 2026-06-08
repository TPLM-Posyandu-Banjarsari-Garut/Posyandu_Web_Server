import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { CadreController } from '@/controllers/cadres-controller'
import { CadreService } from '@/services/cadres-service'
import { CadreRepository } from '@/repositories/cadres-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createCadreSchema,
    updateCadreSchema,
    getCadresQuerySchema,
    cadreParamsSchema,
    deleteCadreQuerySchema
} from '@/validations/cadres-validation'
import db from '@/configs/db'

const router = Router()

const cadre_repository = new CadreRepository(db)
const cadre_service = new CadreService(cadre_repository)
const cadre_controller = new CadreController(cadre_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'cadre'),
    validateRequest({ body: createCadreSchema }),
    AsyncHandler(cadre_controller.createCadre)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'cadre'),
    validateRequest({ query: getCadresQuerySchema }),
    AsyncHandler(cadre_controller.getCadres)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'cadre'),
    validateRequest({ params: cadreParamsSchema }),
    AsyncHandler(cadre_controller.getCadreById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'cadre'),
    validateRequest({ params: cadreParamsSchema, body: updateCadreSchema }),
    AsyncHandler(cadre_controller.updateCadre)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'cadre'),
    validateRequest({
        params: cadreParamsSchema,
        query: deleteCadreQuerySchema
    }),
    AsyncHandler(cadre_controller.deleteCadre)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'cadre'),
    validateRequest({ params: cadreParamsSchema }),
    AsyncHandler(cadre_controller.restoreCadre)
)

export default router
