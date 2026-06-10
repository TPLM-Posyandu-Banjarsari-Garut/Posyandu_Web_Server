import { Request, Response } from 'express'
import { VitaminService } from '@/services/vitamins-service'
import { VitaminQueryFilters } from '@/repositories/vitamins-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class VitaminController {
    constructor(private readonly vitamin_service: VitaminService) {}

    createVitamin = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Vitamin')

        const vitamin = await this.vitamin_service.createVitamin(req.body)

        logger.info({ vitaminId: vitamin.id }, 'Vitamin created successfully')
        return ApiResponse.created(res, 'Vitamin created successfully', vitamin)
    }

    getVitamins = async (req: Request, res: Response) => {
        const query = req.query as unknown as VitaminQueryFilters
        logger.info({ query }, 'Incoming request: Get Vitamins')

        const result = await this.vitamin_service.getVitamins(query)
        return ApiResponse.ok(res, 'Vitamins retrieved successfully', result)
    }

    getVitaminById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'Vitamin',
            this.vitamin_service.getVitaminById.bind(this.vitamin_service)
        )
    }

    updateVitamin = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Vitamin'
        )

        const vitamin = await this.vitamin_service.updateVitamin(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Vitamin updated successfully', vitamin)
    }

    deleteVitamin = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'Vitamin',
            this.vitamin_service.deleteVitamin.bind(this.vitamin_service)
        )
    }

    restoreVitamin = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'Vitamin',
            this.vitamin_service.restoreVitamin.bind(this.vitamin_service)
        )
    }
}
