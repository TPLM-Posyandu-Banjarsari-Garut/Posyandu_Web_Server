import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createHealthCenterSchema,
    updateHealthCenterSchema,
    getHealthCentersQuerySchema,
    healthCenterParamsSchema,
    deleteHealthCenterQuerySchema
} from '@/validations/health-centers-validation'

export const registerHealthCentersRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateHealthCenterInput', createHealthCenterSchema)
    registry.register('UpdateHealthCenterInput', updateHealthCenterSchema)

    const HC_TAG = ['Health Centers']

    registry.registerPath({
        method: 'post',
        path: '/api/health-centers',
        tags: HC_TAG,
        summary: 'Create a new health center',
        request: {
            body: {
                content: {
                    'application/json': { schema: createHealthCenterSchema }
                }
            }
        },
        responses: {
            201: { description: 'Health center created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/health-centers',
        tags: HC_TAG,
        summary: 'Get list of health centers',
        request: { query: getHealthCentersQuerySchema },
        responses: {
            200: { description: 'Success get list of health centers' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/health-centers/{public_id}',
        tags: HC_TAG,
        summary: 'Get health center by public ID',
        request: { params: healthCenterParamsSchema },
        responses: {
            200: { description: 'Success get health center detail' },
            404: { description: 'Health center not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/health-centers/{public_id}',
        tags: HC_TAG,
        summary: 'Update health center data',
        request: {
            params: healthCenterParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateHealthCenterSchema }
                }
            }
        },
        responses: {
            200: { description: 'Health center updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Health center not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/health-centers/{public_id}',
        tags: HC_TAG,
        summary: 'Delete health center',
        request: {
            params: healthCenterParamsSchema,
            query: deleteHealthCenterQuerySchema
        },
        responses: {
            200: { description: 'Health center deleted successfully' },
            404: { description: 'Health center not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/health-centers/{public_id}/restore',
        tags: HC_TAG,
        summary: 'Restore soft-deleted health center',
        request: { params: healthCenterParamsSchema },
        responses: {
            200: { description: 'Health center restored successfully' },
            404: { description: 'Health center not found' }
        }
    })
}
