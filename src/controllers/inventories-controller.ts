import { Request, Response } from 'express'
import { InventoryService } from '@/services/inventories-service'
import { InventoryQueryFilters } from '@/repositories/inventories-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export class InventoryController {
    constructor(private readonly inventory_service: InventoryService) {}

    createInventory = async (req: Request, res: Response) => {
        logger.info({ body: req.body }, 'Incoming request: Create Inventory')

        const inventory = await this.inventory_service.createInventory(req.body)

        logger.info(
            { inventoryId: inventory.id },
            'Inventory created successfully'
        )
        return ApiResponse.created(
            res,
            'Inventory created successfully',
            inventory
        )
    }

    getInventories = async (req: Request, res: Response) => {
        const query = req.query as unknown as InventoryQueryFilters
        logger.info({ query }, 'Incoming request: Get Inventories')

        const result = await this.inventory_service.getInventories(query)
        return ApiResponse.ok(res, 'Inventories retrieved successfully', result)
    }

    getInventoryById = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Get Inventory By ID')

        const inventory =
            await this.inventory_service.getInventoryById(public_id)
        return ApiResponse.ok(
            res,
            'Inventory retrieved successfully',
            inventory
        )
    }

    updateInventory = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info(
            { public_id, body: req.body },
            'Incoming request: Update Inventory'
        )

        const inventory = await this.inventory_service.updateInventory(
            public_id,
            req.body
        )
        return ApiResponse.ok(res, 'Inventory updated successfully', inventory)
    }

    deleteInventory = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        const is_permanent = req.query.permanent === 'true'
        logger.warn(
            { public_id, is_permanent },
            'Incoming request: Delete Inventory'
        )

        const inventory = await this.inventory_service.deleteInventory(
            public_id,
            is_permanent
        )
        return ApiResponse.ok(res, 'Inventory deleted successfully', inventory)
    }

    restoreInventory = async (req: Request, res: Response) => {
        const public_id = req.params.public_id as string
        logger.info({ public_id }, 'Incoming request: Restore Inventory')

        const inventory =
            await this.inventory_service.restoreInventory(public_id)
        return ApiResponse.ok(res, 'Inventory restored successfully', inventory)
    }
}
