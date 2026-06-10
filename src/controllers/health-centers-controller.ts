import { Request, Response } from 'express'
import { HealthCenterService } from '@/services/health-centers-service'
import { HealthCenterQueryFilters } from '@/repositories/health-centers-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

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
        return handleGetByIdRequest(
            req,
            res,
            'HealthCenter',
            this.health_center_service.getHealthCenterById.bind(
                this.health_center_service
            )
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
        return handleDeleteRequest(
            req,
            res,
            'HealthCenter',
            this.health_center_service.deleteHealthCenter.bind(
                this.health_center_service
            )
        )
    }

    restoreHealthCenter = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'HealthCenter',
            this.health_center_service.restoreHealthCenter.bind(
                this.health_center_service
            )
        )
    }
}
