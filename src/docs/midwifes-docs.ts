import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createMidwifeSchema,
    updateMidwifeSchema,
    getMidwifesQuerySchema,
    midwifeParamsSchema,
    deleteMidwifeQuerySchema
} from '@/validations/midwifes-validation'

export const registerMidwifesRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateMidwifeInput', createMidwifeSchema)
    registry.register('UpdateMidwifeInput', updateMidwifeSchema)

    const MIDWIFE_TAG = ['Midwife']

    registry.registerPath({
        method: 'post',
        path: '/api/midwife',
        tags: MIDWIFE_TAG,
        summary: 'Create a new midwife [Roles: admin, midwife]',
        request: {
            body: {
                content: { 'application/json': { schema: createMidwifeSchema } }
            }
        },
        responses: {
            201: { description: 'Midwife created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/midwife',
        tags: MIDWIFE_TAG,
        summary: 'Get list of midwife [Roles: admin, midwife]',
        request: { query: getMidwifesQuerySchema },
        responses: {
            200: { description: 'Success get list of midwife' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/midwife/{public_id}',
        tags: MIDWIFE_TAG,
        summary: 'Get midwife by public ID [Roles: admin, midwife]',
        request: { params: midwifeParamsSchema },
        responses: {
            200: { description: 'Success get midwife detail' },
            404: { description: 'Midwife not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/midwife/{public_id}',
        tags: MIDWIFE_TAG,
        summary: 'Update midwife data [Roles: admin, midwife]',
        request: {
            params: midwifeParamsSchema,
            body: {
                content: { 'application/json': { schema: updateMidwifeSchema } }
            }
        },
        responses: {
            200: { description: 'Midwife updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Midwife not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/midwife/{public_id}',
        tags: MIDWIFE_TAG,
        summary: 'Delete midwife [Roles: admin, midwife]',
        request: {
            params: midwifeParamsSchema,
            query: deleteMidwifeQuerySchema
        },
        responses: {
            200: { description: 'Midwife deleted successfully' },
            404: { description: 'Midwife not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/midwife/{public_id}/restore',
        tags: MIDWIFE_TAG,
        summary: 'Restore soft-deleted midwife [Roles: admin, midwife]',
        request: { params: midwifeParamsSchema },
        responses: {
            200: { description: 'Midwife restored successfully' },
            404: { description: 'Midwife not found' }
        }
    })
}
