import { Request, Response } from 'express'
import { ParentService } from '@/services/parent-service'
import { ParentQueryFilters } from '@/repositories/parents-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

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
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Parent By ID')

        const parent = await this.parent_service.getParentById(public_id)
        return ApiResponse.ok(res, 'Parent retrieved successfully', parent)
    }

    updateParent = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Parent'
        )

        const parent = await this.parent_service.updateParent(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Parent updated successfully', parent)
    }

    deleteParent = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Parent'
        )

        const parent = await this.parent_service.deleteParent(
            public_id,
            is_permanent
        )
        return ApiResponse.ok(res, 'Parent deleted successfully', parent)
    }

    restoreParent = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Parent')

        const parent = await this.parent_service.restoreParent(public_id)
        return ApiResponse.ok(res, 'Parent restored successfully', parent)
    }
}
