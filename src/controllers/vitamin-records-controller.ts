import { Request, Response } from 'express'
import { VitaminRecordService } from '@/services/vitamin-records-service'
import { VitaminRecordQueryFilters } from '@/repositories/vitamin-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class VitaminRecordController {
    constructor(
        private readonly vitamin_record_service: VitaminRecordService
    ) {}

    createVitaminRecord = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body },
            'Incoming request: Create Vitamin Record'
        )

        const record = await this.vitamin_record_service.createVitaminRecord(
            req.body
        )

        logger.info(
            { recordId: record.id },
            'Vitamin Record created successfully'
        )
        return ApiResponse.created(
            res,
            'Vitamin Record created successfully',
            record
        )
    }

    getVitaminRecords = async (req: Request, res: Response) => {
        const query = req.query as unknown as VitaminRecordQueryFilters
        logger.info({ query }, 'Incoming request: Get Vitamin Records')

        const result =
            await this.vitamin_record_service.getVitaminRecords(query)
        return ApiResponse.ok(
            res,
            'Vitamin Records retrieved successfully',
            result
        )
    }

    getVitaminRecordById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Vitamin Record By ID')

        const record =
            await this.vitamin_record_service.getVitaminRecordById(public_id)
        return ApiResponse.ok(
            res,
            'Vitamin Record retrieved successfully',
            record
        )
    }

    updateVitaminRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Vitamin Record'
        )

        const record = await this.vitamin_record_service.updateVitaminRecord(
            public_id,
            req.body
        )
        return ApiResponse.ok(
            res,
            'Vitamin Record updated successfully',
            record
        )
    }

    deleteVitaminRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Vitamin Record'
        )

        const record = await this.vitamin_record_service.deleteVitaminRecord(
            public_id,
            is_permanent
        )
        return ApiResponse.ok(
            res,
            'Vitamin Record deleted successfully',
            record
        )
    }

    restoreVitaminRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Vitamin Record')

        const record =
            await this.vitamin_record_service.restoreVitaminRecord(public_id)
        return ApiResponse.ok(
            res,
            'Vitamin Record restored successfully',
            record
        )
    }
}
