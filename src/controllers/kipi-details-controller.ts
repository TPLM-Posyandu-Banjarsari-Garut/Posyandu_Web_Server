import { Request, Response } from 'express'
import { KipiDetailService } from '@/services/kipi-details-service'
import { KipiDetailQueryFilters } from '@/repositories/kipi-details-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class KipiDetailController {
    constructor(private readonly kipi_detail_service: KipiDetailService) {}

    createKipiDetail = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create KIPI Detail')

        const kipi = await this.kipi_detail_service.createKipiDetail(req.body)

        logger.info({ kipiId: kipi.id }, 'KIPI Detail created successfully')
        return ApiResponse.created(
            res,
            'KIPI Detail created successfully',
            kipi
        )
    }

    getKipiDetails = async (req: Request, res: Response) => {
        const query = req.query as unknown as KipiDetailQueryFilters
        logger.info({ query }, 'Incoming request: Get KIPI Details')

        const result = await this.kipi_detail_service.getKipiDetails(query)
        return ApiResponse.ok(
            res,
            'KIPI Details retrieved successfully',
            result
        )
    }

    getKipiDetailById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get KIPI Detail By ID')

        const kipi = await this.kipi_detail_service.getKipiDetailById(public_id)
        return ApiResponse.ok(res, 'KIPI Detail retrieved successfully', kipi)
    }

    updateKipiDetail = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update KIPI Detail'
        )

        const kipi = await this.kipi_detail_service.updateKipiDetail(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'KIPI Detail updated successfully', kipi)
    }

    deleteKipiDetail = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete KIPI Detail'
        )

        const kipi = await this.kipi_detail_service.deleteKipiDetail(
            public_id,
            is_permanent
        )
        return ApiResponse.ok(res, 'KIPI Detail deleted successfully', kipi)
    }

    restoreKipiDetail = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore KIPI Detail')

        const kipi = await this.kipi_detail_service.restoreKipiDetail(public_id)
        return ApiResponse.ok(res, 'KIPI Detail restored successfully', kipi)
    }
}
