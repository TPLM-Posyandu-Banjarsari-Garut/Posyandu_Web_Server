import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createInventorySchema,
    updateInventorySchema,
    getInventoriesQuerySchema,
    inventoryParamsSchema,
    deleteInventoryQuerySchema
} from '@/validations/inventories-validation'

export const registerInventoriesRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateInventoryInput', createInventorySchema)
    registry.register('UpdateInventoryInput', updateInventorySchema)

    const INV_TAG = ['Inventories']

    registry.registerPath({
        method: 'post',
        path: '/api/inventories',
        tags: INV_TAG,
        summary: 'Create a new inventory [Roles: admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createInventorySchema }
                }
            }
        },
        responses: {
            201: { description: 'Inventory created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/inventories',
        tags: INV_TAG,
        summary: 'Get list of inventories [Roles: admin, midwife, cadre]',
        request: { query: getInventoriesQuerySchema },
        responses: {
            200: { description: 'Success get list of inventories' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/inventories/{public_id}',
        tags: INV_TAG,
        summary: 'Get inventory by public ID [Roles: admin, midwife, cadre]',
        request: { params: inventoryParamsSchema },
        responses: {
            200: { description: 'Success get inventory detail' },
            404: { description: 'Inventory not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/inventories/{public_id}',
        tags: INV_TAG,
        summary: 'Update inventory data [Roles: admin, midwife, cadre]',
        request: {
            params: inventoryParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateInventorySchema }
                }
            }
        },
        responses: {
            200: { description: 'Inventory updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Inventory not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/inventories/{public_id}',
        tags: INV_TAG,
        summary: 'Delete inventory [Roles: admin, midwife, cadre]',
        request: {
            params: inventoryParamsSchema,
            query: deleteInventoryQuerySchema
        },
        responses: {
            200: { description: 'Inventory deleted successfully' },
            404: { description: 'Inventory not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/inventories/{public_id}/restore',
        tags: INV_TAG,
        summary:
            'Restore soft-deleted inventory [Roles: admin, midwife, cadre]',
        request: { params: inventoryParamsSchema },
        responses: {
            200: { description: 'Inventory restored successfully' },
            404: { description: 'Inventory not found' }
        }
    })
}
