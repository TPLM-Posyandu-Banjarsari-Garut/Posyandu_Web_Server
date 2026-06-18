import { Request, Response } from 'express'
import { PregnancyRecordsService } from '@/services/pregnancy-records-service'
import { PregnancyRecordQueryFilters } from '@/repositories/pregnancy-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class PregnancyRecordsController {
    constructor(private readonly service: PregnancyRecordsService) {}

    createPregnancyRecord = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body },
            'Incoming request: Create Pregnancy Record'
        )
        const record = await this.service.createPregnancyRecord(req.body)
        logger.info({ id: record.id }, 'Pregnancy record created successfully')
        return ApiResponse.created(
            res,
            'Pregnancy record created successfully',
            record
        )
    }

    getPregnancyRecords = async (req: Request, res: Response) => {
        const query = req.query as unknown as PregnancyRecordQueryFilters
        logger.info({ query }, 'Incoming request: Get Pregnancy Records')
        const result = await this.service.getPregnancyRecords(query)
        return ApiResponse.ok(
            res,
            'Pregnancy records retrieved successfully',
            result
        )
    }

    getPregnancyRecordById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'PregnancyRecord',
            this.service.getPregnancyRecordById.bind(this.service)
        )
    }

    updatePregnancyRecord = async (req: Request, res: Response) => {
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Pregnancy Record'
        )
        const record = await this.service.updatePregnancyRecord(
            public_id,
            req.body
        )
        return ApiResponse.ok(
            res,
            'Pregnancy record updated successfully',
            record
        )
    }

    deletePregnancyRecord = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'PregnancyRecord',
            this.service.deletePregnancyRecord.bind(this.service)
        )
    }

    restorePregnancyRecord = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'PregnancyRecord',
            this.service.restorePregnancyRecord.bind(this.service)
        )
    }
}
