import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createPosyanduSchema,
    updatePosyanduSchema,
    getPosyandusQuerySchema,
    posyanduParamsSchema,
    deletePosyanduQuerySchema
} from '@/validations/posyandus-validation'

export const registerPosyandusRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreatePosyanduInput', createPosyanduSchema)
    registry.register('UpdatePosyanduInput', updatePosyanduSchema)

    const POSYANDU_TAG = ['Posyandus']

    registry.registerPath({
        method: 'post',
        path: '/api/posyandus',
        tags: POSYANDU_TAG,
        summary: 'Create a new posyandu [Roles: posyandu_admin, village_admin]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createPosyanduSchema }
                }
            }
        },
        responses: {
            201: { description: 'Posyandu created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/posyandus',
        tags: POSYANDU_TAG,
        summary: 'Get list of posyandus [Roles: posyandu_admin, village_admin]',
        request: { query: getPosyandusQuerySchema },
        responses: {
            200: { description: 'Success get list of posyandus' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/posyandus/{public_id}',
        tags: POSYANDU_TAG,
        summary:
            'Get posyandu by public ID [Roles: posyandu_admin, village_admin]',
        request: { params: posyanduParamsSchema },
        responses: {
            200: { description: 'Success get posyandu detail' },
            404: { description: 'Posyandu not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/posyandus/{public_id}',
        tags: POSYANDU_TAG,
        summary: 'Update posyandu data [Roles: posyandu_admin, village_admin]',
        request: {
            params: posyanduParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updatePosyanduSchema }
                }
            }
        },
        responses: {
            200: { description: 'Posyandu updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Posyandu not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/posyandus/{public_id}',
        tags: POSYANDU_TAG,
        summary: 'Delete posyandu [Roles: posyandu_admin, village_admin]',
        request: {
            params: posyanduParamsSchema,
            query: deletePosyanduQuerySchema
        },
        responses: {
            200: { description: 'Posyandu deleted successfully' },
            404: { description: 'Posyandu not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/posyandus/{public_id}/restore',
        tags: POSYANDU_TAG,
        summary:
            'Restore soft-deleted posyandu [Roles: posyandu_admin, village_admin]',
        request: { params: posyanduParamsSchema },
        responses: {
            200: { description: 'Posyandu restored successfully' },
            404: { description: 'Posyandu not found' }
        }
    })
}
