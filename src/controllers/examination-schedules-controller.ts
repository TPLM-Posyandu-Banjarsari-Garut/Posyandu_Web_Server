import { Request, Response } from 'express'
import { ExaminationSchedulesService } from '@/services/examination-schedules-service'
import { ExaminationSchedulesQueryFilters } from '@/repositories/examination-schedules-repository'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ExaminationSchedulesController {
    constructor(private readonly service: ExaminationSchedulesService) {}

    createSchedule = async (req: Request, res: Response) => {
        const user = res.locals.user
        logger.info(
            { body: req.body },
            'Incoming request: Create Examination Schedule'
        )

        if (user?.posyandu_id && req.body.posyandu_id !== user.posyandu_id) {
            throw ApiError.forbidden(
                'Cannot create examination schedule for a different Posyandu'
            )
        }

        const record = await this.service.createSchedule(req.body)
        logger.info(
            { id: record.id },
            'Examination schedule created successfully'
        )
        return ApiResponse.created(
            res,
            'Examination schedule created successfully',
            record
        )
    }

    getSchedules = async (req: Request, res: Response) => {
        const user = res.locals.user
        const query = req.query as unknown as ExaminationSchedulesQueryFilters
        logger.info({ query }, 'Incoming request: Get Examination Schedules')

        if (user?.posyandu_id) {
            query.posyandu_id = user.posyandu_id
        }

        const result = await this.service.getSchedules(query)
        return ApiResponse.ok(
            res,
            'Examination schedules retrieved successfully',
            result
        )
    }

    getScheduleById = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleGetByIdRequest(
            req,
            res,
            'ExaminationSchedule',
            async id => {
                const record = await this.service.getScheduleById(id)
                if (
                    user?.posyandu_id &&
                    record.posyandu_id !== user.posyandu_id
                ) {
                    throw ApiError.forbidden(
                        'Access denied. Schedule belongs to a different Posyandu.'
                    )
                }
                return record
            }
        )
    }

    updateSchedule = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Examination Schedule'
        )

        const existing = await this.service.getScheduleById(public_id)
        if (user?.posyandu_id) {
            if (existing.posyandu_id !== user.posyandu_id) {
                throw ApiError.forbidden(
                    'Access denied. Schedule belongs to a different Posyandu.'
                )
            }
            if (
                req.body.posyandu_id &&
                req.body.posyandu_id !== user.posyandu_id
            ) {
                throw ApiError.forbidden(
                    'Cannot assign schedule to a different Posyandu'
                )
            }
        }

        const record = await this.service.updateSchedule(public_id, req.body)
        return ApiResponse.ok(
            res,
            'Examination schedule updated successfully',
            record
        )
    }

    deleteSchedule = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleDeleteRequest(
            req,
            res,
            'ExaminationSchedule',
            async (id, isPermanent) => {
                const existing = await this.service.getScheduleById(id)
                if (
                    user?.posyandu_id &&
                    existing.posyandu_id !== user.posyandu_id
                ) {
                    throw ApiError.forbidden(
                        'Access denied. Schedule belongs to a different Posyandu.'
                    )
                }
                return this.service.deleteSchedule(id, isPermanent)
            }
        )
    }

    restoreSchedule = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleRestoreRequest(
            req,
            res,
            'ExaminationSchedule',
            async id => {
                const existing = await this.service.getScheduleById(id)
                if (
                    user?.posyandu_id &&
                    existing.posyandu_id !== user.posyandu_id
                ) {
                    throw ApiError.forbidden(
                        'Access denied. Schedule belongs to a different Posyandu.'
                    )
                }
                return this.service.restoreSchedule(id)
            }
        )
    }
}
