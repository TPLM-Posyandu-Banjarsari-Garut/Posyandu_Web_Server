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
        logger.info(
            { body: req.body },
            'Incoming request: Create Examination Record'
        )
        const record = await this.service.createRecord(req.body)
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
        const query = req.query as unknown as ExaminationRecordsQueryFilters
        logger.info({ query }, 'Incoming request: Get Examination Records')
        const result = await this.service.getRecords(query)
        return ApiResponse.ok(
            res,
            'Examination records retrieved successfully',
            result
        )
    }

    getRecordById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'ExaminationRecord',
            this.service.getRecordById.bind(this.service)
        )
    }

    updateRecord = async (req: Request, res: Response) => {
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Examination Record'
        )
        const record = await this.service.updateRecord(public_id, req.body)
        return ApiResponse.ok(
            res,
            'Examination record updated successfully',
            record
        )
    }

    deleteRecord = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'ExaminationRecord',
            this.service.deleteRecord.bind(this.service)
        )
    }

    restoreRecord = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'ExaminationRecord',
            this.service.restoreRecord.bind(this.service)
        )
    }
}
