import { Request, Response } from 'express'
import { HealthCenterService } from '@/services/health-centers-service'
import { HealthCenterQueryFilters } from '@/repositories/health-centers-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class HealthCenterController {
    constructor(private readonly health_center_service: HealthCenterService) {}

    createHealthCenter = async (req: Request, res: Response) => {
        logger.info(
            { body: req.body },
            'Incoming request: Create Health Center'
        )

        const health_center =
            await this.health_center_service.createHealthCenter(req.body)

        logger.info(
            { healthCenterId: health_center.id },
            'Health Center created successfully'
        )
        return ApiResponse.created(
            res,
            'Health Center created successfully',
            health_center
        )
    }

    getHealthCenters = async (req: Request, res: Response) => {
        const query = req.query as unknown as HealthCenterQueryFilters
        logger.info({ query }, 'Incoming request: Get Health Centers')

        const result = await this.health_center_service.getHealthCenters(query)
        return ApiResponse.ok(
            res,
            'Health Centers retrieved successfully',
            result
        )
    }

    getHealthCenterById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Health Center By ID')

        const health_center =
            await this.health_center_service.getHealthCenterById(public_id)
        return ApiResponse.ok(
            res,
            'Health Center retrieved successfully',
            health_center
        )
    }

    updateHealthCenter = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Health Center'
        )

        const health_center =
            await this.health_center_service.updateHealthCenter(
                public_id,
                req.body
            )
        return ApiResponse.ok(
            res,
            'Health Center updated successfully',
            health_center
        )
    }

    deleteHealthCenter = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Health Center'
        )

        const health_center =
            await this.health_center_service.deleteHealthCenter(
                public_id,
                is_permanent
            )
        return ApiResponse.ok(
            res,
            'Health Center deleted successfully',
            health_center
        )
    }

    restoreHealthCenter = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Health Center')

        const health_center =
            await this.health_center_service.restoreHealthCenter(public_id)
        return ApiResponse.ok(
            res,
            'Health Center restored successfully',
            health_center
        )
    }
}
