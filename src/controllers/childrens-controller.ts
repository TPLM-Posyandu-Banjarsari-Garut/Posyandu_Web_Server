import { Request, Response } from 'express'
import { ChildrenService } from '@/services/childrens-service'
import { ChildrenQueryFilters } from '@/repositories/childrens-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class ChildrenController {
    constructor(private readonly children_service: ChildrenService) {}

    createChildren = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Children')

        const child = await this.children_service.createChildren(req.body)

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
        const user = res.locals.user // untuk error ini ada hubungannya
        const query = req.query as unknown as ChildrenQueryFilters

        logger.info(
            { userId: user?.id, query },
            'Incoming request: Get Childrens'
        )

        if (user?.role === 'parent') {
            query.parent_id = user.parent_id
        } else if (
            (user?.role === 'cadre' || user?.role === 'midwife') &&
            user.posyandu_id
        ) {
            query.posyandu_id = user.posyandu_id
        }

        const result = await this.children_service.getChildrens(query)
        return ApiResponse.ok(res, 'Childrens retrieved successfully', result)
    }

    getChildrenById = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string

        logger.info(
            { userId: user?.id, public_id },
            'Incoming request: Get Children By ID'
        )

        if (user?.role === 'parent') {
            await this.children_service.verifyParentAccess(
                public_id,
                user.parent_id
            )
        }

        const child = await this.children_service.getChildrenById(public_id)
        return ApiResponse.ok(res, 'Children retrieved successfully', child)
    }

    updateChildren = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string

        logger.info(
            { userId: user?.id, public_id, body: req.body },
            'Incoming request: Update Children'
        )

        if (user?.role === 'parent') {
            await this.children_service.verifyParentAccess(
                public_id,
                user.parent_id
            )
        }

        const child = await this.children_service.updateChildren(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Children updated successfully', child)
    }

    deleteChildren = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'

        logger.warn(
            { userId: user?.id, public_id, is_permanent },
            'Incoming request: Delete Children'
        )

        if (user?.role === 'parent') {
            await this.children_service.verifyParentAccess(
                public_id,
                user.parent_id
            )
        }

        const child = await this.children_service.deleteChildren(
            public_id,
            is_permanent
        )
        return ApiResponse.ok(res, 'Children deleted successfully', child)
    }

    restoreChildren = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Children')

        const child = await this.children_service.restoreChildren(public_id)
        return ApiResponse.ok(res, 'Children restored successfully', child)
    }
}
