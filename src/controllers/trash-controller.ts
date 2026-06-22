import { Request, Response } from 'express'
import { TrashService } from '@/services/trash-service'
import { TrashQueryFilters, TrashItem } from '@/repositories/trash-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class TrashController {
    constructor(private readonly trashService: TrashService) {}

    getTrash = async (req: Request, res: Response) => {
        const query = req.query as unknown as TrashQueryFilters
        logger.info({ query }, 'Incoming request: Get Trash')

        const result = await this.trashService.getTrashItems(query)
        return ApiResponse.ok(res, 'Trash items retrieved successfully', result)
    }

    restoreItem = async (req: Request, res: Response) => {
        const { type, public_id } = req.params as {
            type: TrashItem['type']
            public_id: string
        }
        logger.info({ type, public_id }, 'Incoming request: Restore Trash Item')

        const result = await this.trashService.restoreTrashItem(type, public_id)
        return ApiResponse.ok(res, `${type} restored successfully`, result)
    }
}
