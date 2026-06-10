import { Request, Response } from 'express'
import { MidwifeService } from '@/services/midwifes-service'
import { MidwifeQueryFilters } from '@/repositories/midwifes-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class MidwifeController {
    constructor(private readonly midwife_service: MidwifeService) {}

    createMidwife = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Midwife')

        const midwife = await this.midwife_service.createMidwife(req.body)

        logger.info({ midwifeId: midwife.id }, 'Midwife created successfully')
        return ApiResponse.created(res, 'Midwife created successfully', midwife)
    }

    getmidwifes = async (req: Request, res: Response) => {
        const query = req.query as unknown as MidwifeQueryFilters
        logger.info({ query }, 'Incoming request: Get midwifes')

        const result = await this.midwife_service.getMidwifes(query)
        return ApiResponse.ok(res, 'midwifes retrieved successfully', result)
    }

    getMidwifeById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'Midwife',
            this.midwife_service.getMidwifeById.bind(this.midwife_service)
        )
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
        return handleDeleteRequest(
            req,
            res,
            'Midwife',
            this.midwife_service.deleteMidwife.bind(this.midwife_service)
        )
    }

    restoreMidwife = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'Midwife',
            this.midwife_service.restoreMidwife.bind(this.midwife_service)
        )
    }
}
