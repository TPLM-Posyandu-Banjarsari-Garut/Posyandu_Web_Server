import { Request, Response } from 'express'
import { ImmunizationRecordService } from '@/services/immunization-records-service'
import { ImmunizationRecordQueryFilters } from '@/repositories/immunization-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

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
            await this.immunization_record_service.getImmunizationRecords(
                query,
                res.locals.user
            )
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

        const result =
            await this.immunization_record_service.getImmunizationRecordById(
                public_id,
                res.locals.user
            )
        return ApiResponse.ok(
            res,
            'ImmunizationRecord retrieved successfully',
            result
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
        return handleDeleteRequest(
            req,
            res,
            'ImmunizationRecord',
            this.immunization_record_service.deleteImmunizationRecord.bind(
                this.immunization_record_service
            )
        )
    }

    restoreImmunizationRecord = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'ImmunizationRecord',
            this.immunization_record_service.restoreImmunizationRecord.bind(
                this.immunization_record_service
            )
        )
    }
}
