import { Request, Response } from 'express'
import { VaccineService } from '@/services/vaccines-service'
import { VaccineQueryFilters } from '@/repositories/vaccines-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class VaccineController {
    constructor(private readonly vaccine_service: VaccineService) {}

    createVaccine = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Vaccine')

        const vaccine = await this.vaccine_service.createVaccine(req.body)

        logger.info({ vaccineId: vaccine.id }, 'Vaccine created successfully')
        return ApiResponse.created(res, 'Vaccine created successfully', vaccine)
    }

    getVaccines = async (req: Request, res: Response) => {
        const query = req.query as unknown as VaccineQueryFilters
        logger.info({ query }, 'Incoming request: Get Vaccines')

        const result = await this.vaccine_service.getVaccines(query)
        return ApiResponse.ok(res, 'Vaccines retrieved successfully', result)
    }

    getVaccineById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Vaccine By ID')

        const vaccine = await this.vaccine_service.getVaccineById(public_id)
        return ApiResponse.ok(res, 'Vaccine retrieved successfully', vaccine)
    }

    updateVaccine = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Vaccine'
        )

        const vaccine = await this.vaccine_service.updateVaccine(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Vaccine updated successfully', vaccine)
    }

    deleteVaccine = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Vaccine'
        )

        const vaccine = await this.vaccine_service.deleteVaccine(
            public_id,
            is_permanent
        )
        return ApiResponse.ok(res, 'Vaccine deleted successfully', vaccine)
    }

    restoreVaccine = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Vaccine')

        const vaccine = await this.vaccine_service.restoreVaccine(public_id)
        return ApiResponse.ok(res, 'Vaccine restored successfully', vaccine)
    }
}
