import { Request, Response } from 'express'
import { ExaminationRecordsService } from '@/services/examination-records-service'
import { ExaminationRecordsQueryFilters } from '@/repositories/examination-records-repository'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ExaminationRecordsController {
    constructor(private readonly service: ExaminationRecordsService) {}

    createRecord = async (req: Request, res: Response) => {
        const user = res.locals.user
        logger.info(
            { body: req.body },
            'Incoming request: Create Examination Record'
        )

        if (user?.posyandu_id && req.body.posyandu_id !== user.posyandu_id) {
            throw ApiError.forbidden(
                'Cannot create examination record for a different Posyandu'
            )
        }

        const record = await this.service.createRecord(req.body)
        logger.info(
            { id: record.id },
            'Examination record created successfully'
        )
        return ApiResponse.created(
            res,
            'Examination record created successfully',
            record
        )
    }

    getRecords = async (req: Request, res: Response) => {
        const user = res.locals.user
        const query = req.query as unknown as ExaminationRecordsQueryFilters
        logger.info({ query }, 'Incoming request: Get Examination Records')

        if (user?.role === 'parent') {
            query.parent_id = user.parent_id
        } else if (
            (user?.role === 'cadre' || user?.role === 'midwife') &&
            user.posyandu_id
        ) {
            query.posyandu_id = user.posyandu_id
        }

        const result = await this.service.getRecords(query)
        return ApiResponse.ok(
            res,
            'Examination records retrieved successfully',
            result
        )
    }

    getRecordById = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleGetByIdRequest(req, res, 'ExaminationRecord', async id => {
            const record = await this.service.getRecordById(id)
            if (
                user?.role === 'parent' &&
                record.parent_id !== user.parent_id
            ) {
                throw ApiError.forbidden(
                    'Access denied. You do not own this record.'
                )
            }
            if (
                (user?.role === 'cadre' || user?.role === 'midwife') &&
                user.posyandu_id
            ) {
                if (record.posyandu_id !== user.posyandu_id) {
                    throw ApiError.forbidden(
                        'Access denied. Record belongs to a different Posyandu.'
                    )
                }
            }
            return record
        })
    }

    updateRecord = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = (req.params.public_id || req.params.id) as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Examination Record'
        )

        const existing = await this.service.getRecordById(public_id)
        if (user?.role === 'parent' && existing.parent_id !== user.parent_id) {
            throw ApiError.forbidden(
                'Access denied. You do not own this record.'
            )
        }
        if (
            (user?.role === 'cadre' || user?.role === 'midwife') &&
            user.posyandu_id
        ) {
            if (existing.posyandu_id !== user.posyandu_id) {
                throw ApiError.forbidden(
                    'Access denied. Record belongs to a different Posyandu.'
                )
            }
            if (
                req.body.posyandu_id &&
                req.body.posyandu_id !== user.posyandu_id
            ) {
                throw ApiError.forbidden(
                    'Cannot assign record to a different Posyandu'
                )
            }
        }

        const record = await this.service.updateRecord(public_id, req.body)
        return ApiResponse.ok(
            res,
            'Examination record updated successfully',
            record
        )
    }

    deleteRecord = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleDeleteRequest(
            req,
            res,
            'ExaminationRecord',
            async (id, isPermanent) => {
                const existing = await this.service.getRecordById(id)
                if (
                    user?.role === 'parent' &&
                    existing.parent_id !== user.parent_id
                ) {
                    throw ApiError.forbidden(
                        'Access denied. You do not own this record.'
                    )
                }
                if (
                    (user?.role === 'cadre' || user?.role === 'midwife') &&
                    user.posyandu_id
                ) {
                    if (existing.posyandu_id !== user.posyandu_id) {
                        throw ApiError.forbidden(
                            'Access denied. Record belongs to a different Posyandu.'
                        )
                    }
                }
                return this.service.deleteRecord(id, isPermanent)
            }
        )
    }

    restoreRecord = async (req: Request, res: Response) => {
        const user = res.locals.user
        return handleRestoreRequest(req, res, 'ExaminationRecord', async id => {
            const existing = await this.service.getRecordById(id)
            if (
                user?.role === 'parent' &&
                existing.parent_id !== user.parent_id
            ) {
                throw ApiError.forbidden(
                    'Access denied. You do not own this record.'
                )
            }
            if (
                (user?.role === 'cadre' || user?.role === 'midwife') &&
                user.posyandu_id
            ) {
                if (existing.posyandu_id !== user.posyandu_id) {
                    throw ApiError.forbidden(
                        'Access denied. Record belongs to a different Posyandu.'
                    )
                }
            }
            return this.service.restoreRecord(id)
        })
    }
}
