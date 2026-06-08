import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { Router } from 'express'
import { InventoryController } from '@/controllers/inventories-controller'
import { InventoryService } from '@/services/inventories-service'
import { InventoryRepository } from '@/repositories/inventories-repository'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    createInventorySchema,
    updateInventorySchema,
    getInventoriesQuerySchema,
    inventoryParamsSchema,
    deleteInventoryQuerySchema
} from '@/validations/inventories-validation'
import db from '@/configs/db'

const router = Router()

const inventory_repository = new InventoryRepository(db)
const inventory_service = new InventoryService(inventory_repository)
const inventory_controller = new InventoryController(inventory_service)

router.post(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ body: createInventorySchema }),
    AsyncHandler(inventory_controller.createInventory)
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ query: getInventoriesQuerySchema }),
    AsyncHandler(inventory_controller.getInventories)
)

router.get(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ params: inventoryParamsSchema }),
    AsyncHandler(inventory_controller.getInventoryById)
)

router.put(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: inventoryParamsSchema,
        body: updateInventorySchema
    }),
    AsyncHandler(inventory_controller.updateInventory)
)

router.delete(
    '/:public_id',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({
        params: inventoryParamsSchema,
        query: deleteInventoryQuerySchema
    }),
    AsyncHandler(inventory_controller.deleteInventory)
)

router.post(
    '/:public_id/restore',
    verifyAuth,
    authorizeRoles('admin', 'midwife', 'cadre'),
    validateRequest({ params: inventoryParamsSchema }),
    AsyncHandler(inventory_controller.restoreInventory)
)

export default router
