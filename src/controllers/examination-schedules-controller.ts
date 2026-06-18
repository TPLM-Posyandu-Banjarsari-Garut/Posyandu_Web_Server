import { Request, Response } from 'express'
import { ExaminationSchedulesService } from '@/services/examination-schedules-service'
import { ExaminationSchedulesQueryFilters } from '@/repositories/examination-schedules-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ExaminationSchedulesController {
    constructor(private readonly service: ExaminationSchedulesService) {}

    createSchedule = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body },
            'Incoming request: Create Examination Schedule'
        )
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
        const query = req.query as unknown as ExaminationSchedulesQueryFilters
        logger.info({ query }, 'Incoming request: Get Examination Schedules')
        const result = await this.service.getSchedules(query)
        return ApiResponse.ok(
            res,
            'Examination schedules retrieved successfully',
            result
        )
    }

    getScheduleById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'ExaminationSchedule',
            this.service.getScheduleById.bind(this.service)
        )
    }

    updateSchedule = async (req: Request, res: Response) => {
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Examination Schedule'
        )
        const record = await this.service.updateSchedule(public_id, req.body)
        return ApiResponse.ok(
            res,
            'Examination schedule updated successfully',
            record
        )
    }

    deleteSchedule = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'ExaminationSchedule',
            this.service.deleteSchedule.bind(this.service)
        )
    }

    restoreSchedule = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'ExaminationSchedule',
            this.service.restoreSchedule.bind(this.service)
        )
    }
}
