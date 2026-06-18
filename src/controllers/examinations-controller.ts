import { Request, Response } from 'express'
import { ExaminationsService } from '@/services/examinations-service'
import { ExaminationsQueryFilters } from '@/repositories/examinations-repository'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ExaminationsController {
    constructor(private readonly service: ExaminationsService) {}

    createExamination = async (req: Request, res: Response) => {
        const user = res.locals.user
        logger.info(
            { body: req.body },
            'Incoming request: Create Examination Template'
        )

        if (user?.posyandu_id && req.body.posyandu_id !== user.posyandu_id) {
            throw ApiError.forbidden(
                'Cannot create examination template for a different Posyandu'
            )
        }

        const record = await this.service.createExamination(req.body)
        logger.info(
            { id: record.id },
            'Examination template created successfully'
        )
        return ApiResponse.created(
            res,
            'Examination template created successfully',
            record
        )
    }

    getExaminations = async (req: Request, res: Response) => {
        const user = res.locals.user
        const query = req.query as unknown as ExaminationsQueryFilters
        logger.info({ query }, 'Incoming request: Get Examination Templates')

        if (
            (user?.role === 'cadre' || user?.role === 'midwife') &&
            user.posyandu_id
        ) {
            query.posyandu_id = user.posyandu_id
        }

        const result = await this.service.getExaminations(query)
        return ApiResponse.ok(
            res,
            'Examination templates retrieved successfully',
            result
        )
    }

    getExaminationById = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleGetByIdRequest(
            req,
            res,
            'ExaminationTemplate',
            async id => {
                const record = await this.service.getExaminationById(id)
                if (
                    (user?.role === 'cadre' || user?.role === 'midwife') &&
                    user.posyandu_id
                ) {
                    if (record.posyandu_id !== user.posyandu_id) {
                        throw ApiError.forbidden(
                            'Access denied. Template belongs to a different Posyandu.'
                        )
                    }
                }
                return record
            }
        )
    }

    updateExamination = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Examination Template'
        )

        const existing = await this.service.getExaminationById(public_id)
        if (
            (user?.role === 'cadre' || user?.role === 'midwife') &&
            user.posyandu_id
        ) {
            if (existing.posyandu_id !== user.posyandu_id) {
                throw ApiError.forbidden(
                    'Access denied. Template belongs to a different Posyandu.'
                )
            }
            if (
                req.body.posyandu_id &&
                req.body.posyandu_id !== user.posyandu_id
            ) {
                throw ApiError.forbidden(
                    'Cannot assign template to a different Posyandu'
                )
            }
        }

        const record = await this.service.updateExamination(public_id, req.body)
        return ApiResponse.ok(
            res,
            'Examination template updated successfully',
            record
        )
    }

    deleteExamination = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleDeleteRequest(
            req,
            res,
            'ExaminationTemplate',
            async (id, isPermanent) => {
                const existing = await this.service.getExaminationById(id)
                if (
                    (user?.role === 'cadre' || user?.role === 'midwife') &&
                    user.posyandu_id
                ) {
                    if (existing.posyandu_id !== user.posyandu_id) {
                        throw ApiError.forbidden(
                            'Access denied. Template belongs to a different Posyandu.'
                        )
                    }
                }
                return this.service.deleteExamination(id, isPermanent)
            }
        )
    }

    restoreExamination = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleRestoreRequest(
            req,
            res,
            'ExaminationTemplate',
            async id => {
                const existing = await this.service.getExaminationById(id)
                if (
                    (user?.role === 'cadre' || user?.role === 'midwife') &&
                    user.posyandu_id
                ) {
                    if (existing.posyandu_id !== user.posyandu_id) {
                        throw ApiError.forbidden(
                            'Access denied. Template belongs to a different Posyandu.'
                        )
                    }
                }
                return this.service.restoreExamination(id)
            }
        )
    }
}
