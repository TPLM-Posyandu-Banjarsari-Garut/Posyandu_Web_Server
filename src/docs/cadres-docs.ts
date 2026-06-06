import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createCadreSchema,
    updateCadreSchema,
    getCadresQuerySchema,
    cadreParamsSchema,
    deleteCadreQuerySchema
} from '@/validations/cadres-validation'

export const registerCadresRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateCadreInput', createCadreSchema)
    registry.register('UpdateCadreInput', updateCadreSchema)

    const CADRE_TAG = ['Cadres']

    registry.registerPath({
        method: 'post',
        path: '/api/cadres',
        tags: CADRE_TAG,
        summary: 'Create a new cadre',
        request: {
            body: {
                content: { 'application/json': { schema: createCadreSchema } }
            }
        },
        responses: {
            201: { description: 'Cadre created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/cadres',
        tags: CADRE_TAG,
        summary: 'Get list of cadres',
        request: { query: getCadresQuerySchema },
        responses: {
            200: { description: 'Success get list of cadres' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/cadres/{public_id}',
        tags: CADRE_TAG,
        summary: 'Get cadre by public ID',
        request: { params: cadreParamsSchema },
        responses: {
            200: { description: 'Success get cadre detail' },
            404: { description: 'Cadre not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/cadres/{public_id}',
        tags: CADRE_TAG,
        summary: 'Update cadre data',
        request: {
            params: cadreParamsSchema,
            body: {
                content: { 'application/json': { schema: updateCadreSchema } }
            }
        },
        responses: {
            200: { description: 'Cadre updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Cadre not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/cadres/{public_id}',
        tags: CADRE_TAG,
        summary: 'Delete cadre',
        request: { params: cadreParamsSchema, query: deleteCadreQuerySchema },
        responses: {
            200: { description: 'Cadre deleted successfully' },
            404: { description: 'Cadre not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/cadres/{public_id}/restore',
        tags: CADRE_TAG,
        summary: 'Restore soft-deleted cadre',
        request: { params: cadreParamsSchema },
        responses: {
            200: { description: 'Cadre restored successfully' },
            404: { description: 'Cadre not found' }
        }
    })
}
