import { Request, Response } from 'express'
import { ConsultationsService } from '@/services/consultations-service'
import { ConsultationsQueryFilters } from '@/repositories/consultations-repository'
import { GetAvailableSlotsQueryInput } from '@/validations/consultations-validation'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ConsultationsController {
    constructor(private readonly consultations_service: ConsultationsService) {}

    getAvailableSlots = async (req: Request, res: Response) => {
        const { posyandu_id, consultation_type, date } =
            req.query as unknown as GetAvailableSlotsQueryInput
        logger.info(
            { posyandu_id, consultation_type, date },
            'Incoming request: Get Available Slots'
        )

        const slots = await this.consultations_service.getAvailableSlots(
            posyandu_id,
            consultation_type,
            date
        )

        return ApiResponse.ok(
            res,
            'Available slots retrieved successfully',
            slots
        )
    }

    createBooking = async (req: Request, res: Response) => {
        const user = res.locals.user
        logger.info(
            { userId: user?.id, body: req.body },
            'Incoming request: Create Consultation Booking'
        )

        if (user?.role === 'parent' && !user.parent_id) {
            throw ApiError.forbidden(
                'Parent profile is not fully registered yet'
            )
        }

        const parentId =
            user?.role === 'parent' ? user.parent_id : req.body.parent_id
        if (!parentId) {
            throw ApiError.badRequest(
                'parent_id is required to create a booking'
            )
        }

        const booking = await this.consultations_service.createBooking(
            parentId,
            req.body
        )

        const bookingId = Array.isArray(booking)
            ? booking.map(b => b.id).join(', ')
            : booking.id

        logger.info({ bookingId }, 'Consultation booking created successfully')
        return ApiResponse.created(
            res,
            'Consultation booking created successfully',
            booking
        )
    }

    getConsultations = async (req: Request, res: Response) => {
        const user = res.locals.user
        const query = req.query as unknown as ConsultationsQueryFilters
        logger.info(
            { userId: user?.id, query },
            'Incoming request: Get Consultations'
        )

        if (user?.role === 'parent') {
            query.parent_id = user.parent_id
        } else if (
            (user?.role === 'cadre' || user?.role === 'midwife') &&
            user.posyandu_id
        ) {
            query.posyandu_id = user.posyandu_id
        }

        const result = await this.consultations_service.getConsultations(query)
        return ApiResponse.ok(
            res,
            'Consultations retrieved successfully',
            result
        )
    }

    getConsultationById = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string
        logger.info(
            { userId: user?.id, public_id },
            'Incoming request: Get Consultation By Id'
        )

        return handleGetByIdRequest(req, res, 'Consultation', async id => {
            if (user?.role === 'parent') {
                return this.consultations_service.verifyParentAccess(
                    id,
                    user.parent_id
                )
            }
            const consultation =
                await this.consultations_service.getConsultationById(id)
            if (
                (user?.role === 'midwife' || user?.role === 'cadre') &&
                user.posyandu_id
            ) {
                if (consultation.posyandu_id !== user.posyandu_id) {
                    throw ApiError.forbidden(
                        'Access denied. Consultation belongs to a different Posyandu.'
                    )
                }
            }
            return consultation
        })
    }

    updateBooking = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string
        logger.info(
            { userId: user?.id, public_id, body: req.body },
            'Incoming request: Update Booking'
        )

        if (user?.role === 'parent') {
            await this.consultations_service.verifyParentAccess(
                public_id,
                user.parent_id
            )
        }

        const booking = await this.consultations_service.updateBooking(
            public_id,
            req.body
        )
        return ApiResponse.ok(
            res,
            'Consultation booking updated successfully',
            booking
        )
    }

    updateBookingStatus = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string
        logger.info(
            { userId: user?.id, public_id, status: req.body.status },
            'Incoming request: Update Booking Status'
        )

        const actor = {
            role: user?.role,
            midwife_id: user?.midwife_id,
            cadre_id: user?.cadre_id,
            parent_id: user?.parent_id
        }

        const booking = await this.consultations_service.updateBookingStatus(
            public_id,
            actor,
            req.body
        )
        return ApiResponse.ok(
            res,
            'Consultation status updated successfully',
            booking
        )
    }

    deleteBooking = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string
        logger.info(
            { userId: user?.id, public_id },
            'Incoming request: Delete Booking'
        )

        return handleDeleteRequest(
            req,
            res,
            'Consultation',
            async (id, is_permanent) => {
                if (user?.role === 'parent') {
                    await this.consultations_service.verifyParentAccess(
                        id,
                        user.parent_id
                    )
                }
                return this.consultations_service.deleteBooking(
                    id,
                    is_permanent
                )
            }
        )
    }

    restoreBooking = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string
        logger.info(
            { userId: user?.id, public_id },
            'Incoming request: Restore Booking'
        )

        return handleRestoreRequest(req, res, 'Consultation', async id => {
            if (user?.role === 'parent') {
                await this.consultations_service.verifyParentAccess(
                    id,
                    user.parent_id
                )
            }
            return this.consultations_service.restoreBooking(id)
        })
    }
}
