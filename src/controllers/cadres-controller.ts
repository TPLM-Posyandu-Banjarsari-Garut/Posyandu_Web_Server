import { Request, Response } from 'express'
import { CadreService } from '@/services/cadres-service'
import { CadreQueryFilters } from '@/repositories/cadres-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class CadreController {
    constructor(private readonly cadre_service: CadreService) {}

    createCadre = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Cadre')

        const cadre = await this.cadre_service.createCadre(req.body)

        logger.info({ cadreId: cadre.id }, 'Cadre created successfully')
        return ApiResponse.created(res, 'Cadre created successfully', cadre)
    }

    getCadres = async (req: Request, res: Response) => {
        const query = req.query as unknown as CadreQueryFilters
        logger.info({ query }, 'Incoming request: Get Cadres')

        const result = await this.cadre_service.getCadres(query)
        return ApiResponse.ok(res, 'Cadres retrieved successfully', result)
    }

    getCadreById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'Cadre',
            this.cadre_service.getCadreById.bind(this.cadre_service)
        )
    }

    updateCadre = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Cadre'
        )

        const cadre = await this.cadre_service.updateCadre(public_id, req.body)
        return ApiResponse.ok(res, 'Cadre updated successfully', cadre)
    }

    deleteCadre = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'Cadre',
            this.cadre_service.deleteCadre.bind(this.cadre_service)
        )
    }

    restoreCadre = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'Cadre',
            this.cadre_service.restoreCadre.bind(this.cadre_service)
        )
    }
}
