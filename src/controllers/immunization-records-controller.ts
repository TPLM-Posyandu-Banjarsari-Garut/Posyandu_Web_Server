import { Request, Response } from 'express'
import { ImmunizationRecordService } from '@/services/immunization-records-service'
import { ImmunizationRecordQueryFilters } from '@/repositories/immunization-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class ImmunizationRecordController {
    constructor(
        private readonly immunization_record_service: ImmunizationRecordService
    ) {}

    createImmunizationRecord = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body },
            'Incoming request: Create Immunization Record'
        )

        const record =
            await this.immunization_record_service.createImmunizationRecord(
                req.body
            )

        logger.info(
            { recordId: record.id },
            'Immunization Record created successfully'
        )
        return ApiResponse.created(
            res,
            'Immunization Record created successfully',
            record
        )
    }

    getImmunizationRecords = async (req: Request, res: Response) => {
        const query = req.query as unknown as ImmunizationRecordQueryFilters
        logger.info({ query }, 'Incoming request: Get Immunization Records')

        const result =
            await this.immunization_record_service.getImmunizationRecords(query)
        return ApiResponse.ok(
            res,
            'Immunization Records retrieved successfully',
            result
        )
    }

    getImmunizationRecordById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id },
            'Incoming request: Get Immunization Record By ID'
        )

        const record =
            await this.immunization_record_service.getImmunizationRecordById(
                public_id
            )
        return ApiResponse.ok(
            res,
            'Immunization Record retrieved successfully',
            record
        )
    }

    updateImmunizationRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Immunization Record'
        )

        const record =
            await this.immunization_record_service.updateImmunizationRecord(
                public_id,
                req.body
            )
        return ApiResponse.ok(
            res,
            'Immunization Record updated successfully',
            record
        )
    }

    deleteImmunizationRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Immunization Record'
        )

        const record =
            await this.immunization_record_service.deleteImmunizationRecord(
                public_id,
                is_permanent
            )
        return ApiResponse.ok(
            res,
            'Immunization Record deleted successfully',
            record
        )
    }

    restoreImmunizationRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id },
            'Incoming request: Restore Immunization Record'
        )

        const record =
            await this.immunization_record_service.restoreImmunizationRecord(
                public_id
            )
        return ApiResponse.ok(
            res,
            'Immunization Record restored successfully',
            record
        )
    }
}
