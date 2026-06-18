import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { ConsultationsController } from '@/controllers/consultations-controller'
import { ConsultationsService } from '@/services/consultations-service'
import { ConsultationsRepository } from '@/repositories/consultations-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createConsultationSchema,
    updateConsultationSchema,
    updateConsultationStatusSchema,
    getConsultationsQuerySchema,
    consultationParamsSchema,
    deleteConsultationQuerySchema,
    getAvailableSlotsQuerySchema
} from '@/validations/consultations-validation'
import db from '@/configs/db'

const router = Router()

const consultations_repository = new ConsultationsRepository(db)
const consultations_service = new ConsultationsService(consultations_repository)
const consultations_controller = new ConsultationsController(
    consultations_service
)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({ body: createConsultationSchema }),
    AsyncHandler(consultations_controller.createBooking)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ query: getConsultationsQuerySchema }),
    AsyncHandler(consultations_controller.getConsultations)
)

router.get(
    '/slots/available',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ query: getAvailableSlotsQuerySchema }),
    AsyncHandler(consultations_controller.getAvailableSlots)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({ params: consultationParamsSchema }),
    AsyncHandler(consultations_controller.getConsultationById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({
        params: consultationParamsSchema,
        body: updateConsultationSchema
    }),
    AsyncHandler(consultations_controller.updateBooking)
)

router.put(
    '/:public_id/status',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre', 'parent'),
    validateRequest({
        params: consultationParamsSchema,
        body: updateConsultationStatusSchema
    }),
    AsyncHandler(consultations_controller.updateBookingStatus)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({
        params: consultationParamsSchema,
        query: deleteConsultationQuerySchema
    }),
    AsyncHandler(consultations_controller.deleteBooking)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'parent'),
    validateRequest({ params: consultationParamsSchema }),
    AsyncHandler(consultations_controller.restoreBooking)
)

export default router
