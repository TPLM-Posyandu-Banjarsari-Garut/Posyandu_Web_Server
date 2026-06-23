import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createVitaminSchema,
    updateVitaminSchema,
    getVitaminsQuerySchema,
    vitaminParamsSchema,
    deleteVitaminQuerySchema
} from '@/validations/vitamins-validation'

export const registerVitaminsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateVitaminInput', createVitaminSchema)
    registry.register('UpdateVitaminInput', updateVitaminSchema)

    const VIT_TAG = ['Vitamins']

    registry.registerPath({
        method: 'post',
        path: '/api/vitamins',
        tags: VIT_TAG,
        summary:
            'Create a new vitamin [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createVitaminSchema }
                }
            }
        },
        responses: {
            201: { description: 'Vitamin created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/vitamins',
        tags: VIT_TAG,
        summary:
            'Get list of vitamins [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getVitaminsQuerySchema },
        responses: {
            200: { description: 'Success get list of vitamins' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/vitamins/{public_id}',
        tags: VIT_TAG,
        summary:
            'Get vitamin by public ID [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { params: vitaminParamsSchema },
        responses: {
            200: { description: 'Success get vitamin detail' },
            404: { description: 'Vitamin not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/vitamins/{public_id}',
        tags: VIT_TAG,
        summary:
            'Update vitamin data [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: vitaminParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateVitaminSchema }
                }
            }
        },
        responses: {
            200: { description: 'Vitamin updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Vitamin not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/vitamins/{public_id}',
        tags: VIT_TAG,
        summary:
            'Delete vitamin [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: vitaminParamsSchema,
            query: deleteVitaminQuerySchema
        },
        responses: {
            200: { description: 'Vitamin deleted successfully' },
            404: { description: 'Vitamin not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/vitamins/{public_id}/restore',
        tags: VIT_TAG,
        summary:
            'Restore soft-deleted vitamin [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: { params: vitaminParamsSchema },
        responses: {
            200: { description: 'Vitamin restored successfully' },
            404: { description: 'Vitamin not found' }
        }
    })
}
