import { Request, Response } from 'express'
import { VitaminService } from '@/services/vitamins-service'
import { VitaminQueryFilters } from '@/repositories/vitamins-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

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
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Vitamin By ID')

        const vitamin = await this.vitamin_service.getVitaminById(public_id)
        return ApiResponse.ok(res, 'Vitamin retrieved successfully', vitamin)
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
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Vitamin'
        )

        const vitamin = await this.vitamin_service.deleteVitamin(
            public_id,
            is_permanent
        )
        return ApiResponse.ok(res, 'Vitamin deleted successfully', vitamin)
    }

    restoreVitamin = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Vitamin')

        const vitamin = await this.vitamin_service.restoreVitamin(public_id)
        return ApiResponse.ok(res, 'Vitamin restored successfully', vitamin)
    }
}
