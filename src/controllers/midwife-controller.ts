import { Request, Response } from 'express'
import { MidwifeService } from '@/services/midwife-service'
import { MidwifeQueryFilters } from '@/repositories/midwife-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class MidwifeController {
    constructor(private readonly midwife_service: MidwifeService) {}

    createMidwife = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Midwife')

        const midwife = await this.midwife_service.createMidwife(req.body)

        logger.info({ midwifeId: midwife.id }, 'Midwife created successfully')
        return ApiResponse.created(res, 'Midwife created successfully', midwife)
    }

    getMidwifes = async (req: Request, res: Response) => {
        const query = req.query as unknown as MidwifeQueryFilters
        logger.info({ query }, 'Incoming request: Get Midwifes')

        const result = await this.midwife_service.getMidwifes(query)
        return ApiResponse.ok(res, 'Midwifes retrieved successfully', result)
    }

    getMidwifeById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Midwife By ID')

        const midwife = await this.midwife_service.getMidwifeById(public_id)
        return ApiResponse.ok(res, 'Midwife retrieved successfully', midwife)
    }

    updateMidwife = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Midwife'
        )

        const midwife = await this.midwife_service.updateMidwife(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Midwife updated successfully', midwife)
    }

    deleteMidwife = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.warn({ public_id }, 'Incoming request: Delete Midwife')

        const midwife = await this.midwife_service.deleteMidwife(public_id)
        return ApiResponse.ok(res, 'Midwife deleted successfully', midwife)
    }
}
