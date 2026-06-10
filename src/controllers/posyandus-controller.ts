import { Request, Response } from 'express'
import { PosyanduService } from '@/services/posyandus-service'
import { PosyanduQueryFilters } from '@/repositories/posyandus-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class PosyanduController {
    constructor(private readonly posyandu_service: PosyanduService) {}

    createPosyandu = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Posyandu')

        const posyandu = await this.posyandu_service.createPosyandu(req.body)

        logger.info(
            { posyanduId: posyandu.id },
            'Posyandu created successfully'
        )
        return ApiResponse.created(
            res,
            'Posyandu created successfully',
            posyandu
        )
    }

    getPosyandus = async (req: Request, res: Response) => {
        const query = req.query as unknown as PosyanduQueryFilters
        logger.info({ query }, 'Incoming request: Get Posyandus')

        const result = await this.posyandu_service.getPosyandus(query)
        return ApiResponse.ok(res, 'Posyandus retrieved successfully', result)
    }

    getPosyanduById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'Posyandu',
            this.posyandu_service.getPosyanduById.bind(this.posyandu_service)
        )
    }

    updatePosyandu = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Posyandu'
        )

        const posyandu = await this.posyandu_service.updatePosyandu(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Posyandu updated successfully', posyandu)
    }

    deletePosyandu = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'Posyandu',
            this.posyandu_service.deletePosyandu.bind(this.posyandu_service)
        )
    }

    restorePosyandu = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'Posyandu',
            this.posyandu_service.restorePosyandu.bind(this.posyandu_service)
        )
    }
}
