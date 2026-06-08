import { Request, Response } from 'express'
import { EducationService } from '@/services/educations-service'
import { EducationQueryFilters } from '@/repositories/educations-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class EducationController {
    constructor(private readonly educationService: EducationService) {}

    createEducation = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Education')

        const education = await this.educationService.createEducation(req.body)

        logger.info(
            { educationId: education.id },
            'Education article created successfully'
        )
        return ApiResponse.created(
            res,
            'Education article created successfully',
            education
        )
    }

    getEducations = async (req: Request, res: Response) => {
        const query = req.query as unknown as EducationQueryFilters
        logger.info({ query }, 'Incoming request: Get Educations')

        const result = await this.educationService.getEducations(query)
        return ApiResponse.ok(res, 'Educations retrieved successfully', result)
    }

    getEducationById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Education By ID')

        // Increment view count when fetching single article details
        const education = await this.educationService.getEducationById(
            public_id,
            true
        )
        return ApiResponse.ok(
            res,
            'Education article retrieved successfully',
            education
        )
    }

    updateEducation = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Education'
        )

        const education = await this.educationService.updateEducation(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Education updated successfully', education)
    }

    deleteEducation = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const isPermanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, isPermanent },
            'Incoming request: Delete Education'
        )

        const education = await this.educationService.deleteEducation(
            public_id,
            isPermanent
        )
        return ApiResponse.ok(res, 'Education deleted successfully', education)
    }

    restoreEducation = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Education')

        const education =
            await this.educationService.restoreEducation(public_id)
        return ApiResponse.ok(res, 'Education restored successfully', education)
    }
}
