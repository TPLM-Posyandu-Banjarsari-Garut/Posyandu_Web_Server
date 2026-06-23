import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { KipiDetailController } from '@/controllers/kipi-details-controller'
import { KipiDetailService } from '@/services/kipi-details-service'
import { KipiDetailRepository } from '@/repositories/kipi-details-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createKipiDetailSchema,
    updateKipiDetailSchema,
    getKipiDetailsQuerySchema,
    kipiDetailParamsSchema,
    deleteKipiDetailQuerySchema
} from '@/validations/kipi-details-validation'
import db from '@/configs/db'

const router = Router()

const kipi_detail_repository = new KipiDetailRepository(db)
const kipi_detail_service = new KipiDetailService(kipi_detail_repository)
const kipi_detail_controller = new KipiDetailController(kipi_detail_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ body: createKipiDetailSchema }),
    AsyncHandler(kipi_detail_controller.createKipiDetail)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ query: getKipiDetailsQuerySchema }),
    AsyncHandler(kipi_detail_controller.getKipiDetails)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: kipiDetailParamsSchema }),
    AsyncHandler(kipi_detail_controller.getKipiDetailById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: kipiDetailParamsSchema,
        body: updateKipiDetailSchema
    }),
    AsyncHandler(kipi_detail_controller.updateKipiDetail)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({
        params: kipiDetailParamsSchema,
        query: deleteKipiDetailQuerySchema
    }),
    AsyncHandler(kipi_detail_controller.deleteKipiDetail)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('posyandu_admin', 'village_admin', 'midwife', 'cadre'),
    validateRequest({ params: kipiDetailParamsSchema }),
    AsyncHandler(kipi_detail_controller.restoreKipiDetail)
)

export default router
