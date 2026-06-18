import { Request, Response } from 'express'
import { NutritionRecordService } from '@/services/nutrition-records-service'
import { NutritionRecordQueryFilters } from '@/repositories/nutrition-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

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
        const user = res.locals.user
        const query = req.query as unknown as NutritionRecordQueryFilters
        logger.info(
            { userId: user?.id, query },
            'Incoming request: Get Nutrition Records'
        )

        if (user?.role === 'parent') {
            query.parent_id = user.parent_id
        } else if (
            (user?.role === 'cadre' || user?.role === 'midwife') &&
            user.posyandu_id
        ) {
            query.posyandu_id = user.posyandu_id
        }

        const result =
            await this.nutrition_record_service.getNutritionRecords(query)
        return ApiResponse.ok(
            res,
            'Nutrition Records retrieved successfully',
            result
        )
    }

    getNutritionRecordById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'NutritionRecord',
            this.nutrition_record_service.getNutritionRecordById.bind(
                this.nutrition_record_service
            )
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
        return handleDeleteRequest(
            req,
            res,
            'NutritionRecord',
            this.nutrition_record_service.deleteNutritionRecord.bind(
                this.nutrition_record_service
            )
        )
    }

    restoreNutritionRecord = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'NutritionRecord',
            this.nutrition_record_service.restoreNutritionRecord.bind(
                this.nutrition_record_service
            )
        )
    }
}
