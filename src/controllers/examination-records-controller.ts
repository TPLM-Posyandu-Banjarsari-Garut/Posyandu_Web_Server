import { Request, Response } from 'express'
import { ExaminationRecordsService } from '@/services/examination-records-service'
import { ExaminationRecordsQueryFilters } from '@/repositories/examination-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ExaminationRecordsController {
    constructor(private readonly service: ExaminationRecordsService) {}

    createRecord = async (req: Request, res: Response) => {
        const user = res.locals.user
        logger.info('Incoming request: Create Examination Record')

        const record = await this.service.createRecord(req.body, user)
        logger.info(
            { id: record.id },
            'Examination record created successfully'
        )
        return ApiResponse.created(
            res,
            'Examination record created successfully',
            record
        )
    }

    getRecords = async (req: Request, res: Response) => {
        const user = res.locals.user
        const query = req.query as unknown as ExaminationRecordsQueryFilters
        logger.info('Incoming request: Get Examination Records')

        const result = await this.service.getRecords(query, user)
        return ApiResponse.ok(
            res,
            'Examination records retrieved successfully',
            result
        )
    }

    getRecordById = async (req: Request, res: Response) =>
        handleGetByIdRequest(
            req,
            res,
            'ExaminationRecord',
            (id, currentUser) => this.service.getRecordById(id, currentUser)
        )

    updateRecord = async (req: Request, res: Response) => {
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id },
            'Incoming request: Update Examination Record'
        )

        const record = await this.service.updateRecord(
            public_id,
            req.body,
            res.locals.user
        )
        return ApiResponse.ok(
            res,
            'Examination record updated successfully',
            record
        )
    }

    deleteRecord = async (req: Request, res: Response) =>
        handleDeleteRequest(
            req,
            res,
            'ExaminationRecord',
            (id, isPermanent, currentUser) =>
                this.service.deleteRecord(id, isPermanent, currentUser)
        )

    restoreRecord = async (req: Request, res: Response) =>
        handleRestoreRequest(req, res, 'ExaminationRecord', (id, currentUser) =>
            this.service.restoreRecord(id, currentUser)
        )
}
