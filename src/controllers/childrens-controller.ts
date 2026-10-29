import { Request, Response } from 'express'
import { ChildrenService } from '@/services/childrens-service'
import { ChildrenQueryFilters } from '@/repositories/childrens-repository'
import { GetNewbornReportQueryInput } from '@/validations/childrens-validation'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ChildrenController {
    constructor(private readonly children_service: ChildrenService) {}

    createChildren = async (req: Request, res: Response) => {
        const user = res.locals.user
        logger.info('Incoming request: Create Children')

        const child = await this.children_service.createChildren(req.body, user)

        logger.info(
            { childId: child.id },
            'Children record created successfully'
        )
        return ApiResponse.created(
            res,
            'Children registered successfully',
            child
        )
    }

    getChildrens = async (req: Request, res: Response) => {
        const user = res.locals.user
        const query = req.query as unknown as ChildrenQueryFilters

        logger.info({ userId: user?.id }, 'Incoming request: Get Childrens')

        const result = await this.children_service.getChildrens(query, user)
        return ApiResponse.ok(res, 'Childrens retrieved successfully', result)
    }

    getNewbornReport = async (req: Request, res: Response) => {
        const user = res.locals.user
        const query = req.query as unknown as GetNewbornReportQueryInput

        logger.info({ userId: user?.id }, 'Incoming request: Get Newborn Report')

        const result = await this.children_service.getNewbornReport(
            query,
            user
        )
        return ApiResponse.ok(
            res,
            'Newborn report retrieved successfully',
            result
        )
    }

    getChildrenById = async (req: Request, res: Response) => {
        const user = res.locals.user

        return handleGetByIdRequest(
            req,
            res,
            'Children',
            async (public_id, currentUser) => {
                return this.children_service.getChildrenById(
                    public_id,
                    currentUser
                )
            }
        )
    }

    updateChildren = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string

        logger.info(
            { userId: user?.id, public_id },
            'Incoming request: Update Children'
        )

        const child = await this.children_service.updateChildren(
            public_id,
            req.body,
            user
        )
        return ApiResponse.ok(res, 'Children updated successfully', child)
    }

    deleteChildren = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            'Children',
            async (public_id, is_permanent, currentUser) => {
                return this.children_service.deleteChildren(
                    public_id,
                    is_permanent,
                    currentUser
                )
            }
        )
    }

    restoreChildren = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            'Children',
            async (public_id, currentUser) => {
                return this.children_service.restoreChildren(
                    public_id,
                    currentUser
                )
            }
        )
    }
}
