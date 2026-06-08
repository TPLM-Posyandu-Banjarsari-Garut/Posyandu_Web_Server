import { Request, Response } from 'express'
import { NutritionRecordService } from '@/services/nutrition-records-service'
import { NutritionRecordQueryFilters } from '@/repositories/nutrition-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class NutritionRecordController {
    constructor(
        private readonly nutrition_record_service: NutritionRecordService
    ) {}

    createNutritionRecord = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body },
            'Incoming request: Create Nutrition Record'
        )

        const record =
            await this.nutrition_record_service.createNutritionRecord(req.body)

        logger.info(
            { recordId: record.id },
            'Nutrition Record created successfully'
        )
        return ApiResponse.created(
            res,
            'Nutrition Record created successfully',
            record
        )
    }

    getNutritionRecords = async (req: Request, res: Response) => {
        const query = req.query as unknown as NutritionRecordQueryFilters
        logger.info({ query }, 'Incoming request: Get Nutrition Records')

        const result =
            await this.nutrition_record_service.getNutritionRecords(query)
        return ApiResponse.ok(
            res,
            'Nutrition Records retrieved successfully',
            result
        )
    }

    getNutritionRecordById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id },
            'Incoming request: Get Nutrition Record By ID'
        )

        const record =
            await this.nutrition_record_service.getNutritionRecordById(
                public_id
            )
        return ApiResponse.ok(
            res,
            'Nutrition Record retrieved successfully',
            record
        )
    }

    updateNutritionRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Nutrition Record'
        )

        const record =
            await this.nutrition_record_service.updateNutritionRecord(
                public_id,
                req.body
            )
        return ApiResponse.ok(
            res,
            'Nutrition Record updated successfully',
            record
        )
    }

    deleteNutritionRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Nutrition Record'
        )

        const record =
            await this.nutrition_record_service.deleteNutritionRecord(
                public_id,
                is_permanent
            )
        return ApiResponse.ok(
            res,
            'Nutrition Record deleted successfully',
            record
        )
    }

    restoreNutritionRecord = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Nutrition Record')

        const record =
            await this.nutrition_record_service.restoreNutritionRecord(
                public_id
            )
        return ApiResponse.ok(
            res,
            'Nutrition Record restored successfully',
            record
        )
    }
}
