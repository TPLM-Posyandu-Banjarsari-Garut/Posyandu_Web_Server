import { Request, Response } from 'express'
import { CadreService } from '@/services/cadre-service'
import { CadreQueryFilters } from '@/repositories/cadre-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

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
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Cadre By ID')

        const cadre = await this.cadre_service.getCadreById(public_id)
        return ApiResponse.ok(res, 'Cadre retrieved successfully', cadre)
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
        const public_id = req.params.public_id as string
        logger.warn({ public_id }, 'Incoming request: Delete Cadre')

        const cadre = await this.cadre_service.deleteCadre(public_id)
        return ApiResponse.ok(res, 'Cadre deleted successfully', cadre)
    }
}
