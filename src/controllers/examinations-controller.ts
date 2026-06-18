import { Request, Response } from 'express'
import { ExaminationsService } from '@/services/examinations-service'
import { ExaminationsQueryFilters } from '@/repositories/examinations-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ExaminationsController {
    constructor(private readonly service: ExaminationsService) {}

    createExamination = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body },
            'Incoming request: Create Examination Template'
        )
        const record = await this.service.createExamination(req.body)
        logger.info(
            { id: record.id },
            'Examination template created successfully'
        )
        return ApiResponse.created(
            res,
            'Examination template created successfully',
            record
        )
    }

    getExaminations = async (req: Request, res: Response) => {
        const query = req.query as unknown as ExaminationsQueryFilters
        logger.info({ query }, 'Incoming request: Get Examination Templates')
        const result = await this.service.getExaminations(query)
        return ApiResponse.ok(
            res,
            'Examination templates retrieved successfully',
            result
        )
    }

    getExaminationById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'ExaminationTemplate',
            this.service.getExaminationById.bind(this.service)
        )
    }

    updateExamination = async (req: Request, res: Response) => {
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Examination Template'
        )
        const record = await this.service.updateExamination(public_id, req.body)
        return ApiResponse.ok(
            res,
            'Examination template updated successfully',
            record
        )
    }

    deleteExamination = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'ExaminationTemplate',
            this.service.deleteExamination.bind(this.service)
        )
    }

    restoreExamination = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'ExaminationTemplate',
            this.service.restoreExamination.bind(this.service)
        )
    }
}
