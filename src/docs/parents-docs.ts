import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createParentSchema,
    updateParentSchema,
    getParentsQuerySchema,
    parentParamsSchema,
    deleteParentQuerySchema
} from '@/validations/parents-validation'

export const registerParentsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateParentInput', createParentSchema)
    registry.register('UpdateParentInput', updateParentSchema)

    const PARENT_TAG = ['Parents']

    registry.registerPath({
        method: 'post',
        path: '/api/parents',
        tags: PARENT_TAG,
        summary: 'Create a new parent [Roles: admin, parent]',
        request: {
            body: {
                content: { 'application/json': { schema: createParentSchema } }
            }
        },
        responses: {
            201: { description: 'Parent created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/parents',
        tags: PARENT_TAG,
        summary: 'Get list of parents [Roles: admin, midwife, cadre]',
        request: { query: getParentsQuerySchema },
        responses: {
            200: { description: 'Success get list of parents' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/parents/{public_id}',
        tags: PARENT_TAG,
        summary: 'Get parent by public ID [Roles: admin, parent]',
        request: { params: parentParamsSchema },
        responses: {
            200: { description: 'Success get parent detail' },
            404: { description: 'Parent not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/parents/{public_id}',
        tags: PARENT_TAG,
        summary: 'Update parent data [Roles: admin, parent]',
        request: {
            params: parentParamsSchema,
            body: {
                content: { 'application/json': { schema: updateParentSchema } }
            }
        },
        responses: {
            200: { description: 'Parent updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Parent not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/parents/{public_id}',
        tags: PARENT_TAG,
        summary: 'Delete parent [Roles: admin, parent]',
        request: { params: parentParamsSchema, query: deleteParentQuerySchema },
        responses: {
            200: { description: 'Parent deleted successfully' },
            404: { description: 'Parent not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/parents/{public_id}/restore',
        tags: PARENT_TAG,
        summary: 'Restore soft-deleted parent [Roles: admin, parent]',
        request: { params: parentParamsSchema },
        responses: {
            200: { description: 'Parent restored successfully' },
            404: { description: 'Parent not found' }
        }
    })
}
