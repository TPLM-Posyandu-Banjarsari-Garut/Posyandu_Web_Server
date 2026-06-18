import { Request, Response } from 'express'
import { ParentService } from '@/services/parents-service'
import { ParentQueryFilters } from '@/repositories/parents-repository'
import { ApiResponse } from '@/utils/api-response'
import { ApiError } from '@/utils/api-error'
import { logger } from '@/utils/logger'
import {
    handleDeleteRequest,
    handleGetByIdRequest,
    handleRestoreRequest
} from '@/utils/controller-handlers'

export class ParentController {
    constructor(private readonly parent_service: ParentService) {}

    createParent = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Parent')

        const parent = await this.parent_service.createParent(req.body)

        logger.info({ parentId: parent.id }, 'Parent created successfully')
        return ApiResponse.created(res, 'Parent created successfully', parent)
    }

    getParents = async (req: Request, res: Response) => {
        const query = req.query as unknown as ParentQueryFilters
        logger.info({ query }, 'Incoming request: Get Parents')

        const result = await this.parent_service.getParents(query)
        return ApiResponse.ok(res, 'Parents retrieved successfully', result)
    }

    getParentById = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string

        if (user?.role === 'parent' && user.parent_id !== public_id) {
            throw ApiError.forbidden('You can only access your own profile')
        }

        return handleGetByIdRequest(
            req,
            res,
            'Parent',
            this.parent_service.getParentById.bind(this.parent_service)
        )
    }

    updateParent = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Parent'
        )

        if (user?.role === 'parent' && user.parent_id !== public_id) {
            throw ApiError.forbidden('You can only update your own profile')
        }

        const parent = await this.parent_service.updateParent(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Parent updated successfully', parent)
    }

    deleteParent = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string

        if (user?.role === 'parent' && user.parent_id !== public_id) {
            throw ApiError.forbidden('You can only delete your own profile')
        }

        return handleDeleteRequest(
            req,
            res,
            'Parent',
            this.parent_service.deleteParent.bind(this.parent_service)
        )
    }

    restoreParent = async (req: Request, res: Response) => {
        const user = res.locals.user
        const public_id = req.params.public_id as string

        if (user?.role === 'parent' && user.parent_id !== public_id) {
            throw ApiError.forbidden('You can only restore your own profile')
        }

        return handleRestoreRequest(
            req,
            res,
            'Parent',
            this.parent_service.restoreParent.bind(this.parent_service)
        )
    }
}
