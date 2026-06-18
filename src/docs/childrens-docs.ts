import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createChildSchema,
    updateChildSchema,
    getChildrenQuerySchema,
    childParamsSchema,
    deleteChildQuerySchema
} from '@/validations/childrens-validation'

export const registerChildrenRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateChildInput', createChildSchema)
    registry.register('UpdateChildInput', updateChildSchema)

    const CHILD_TAG = ['Children']
    const SECURITY_AUTH = [{ BearerAuth: [] }]

    registry.registerPath({
        method: 'post',
        path: '/api/childrens',
        tags: CHILD_TAG,
        summary: 'Create a new child [Roles: admin, parent, cadre, midwife]',
        security: SECURITY_AUTH,
        request: {
            body: {
                content: { 'application/json': { schema: createChildSchema } }
            }
        },
        responses: {
            201: { description: 'Child created successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Insufficient permissions' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/childrens',
        tags: CHILD_TAG,
        summary: 'Get list of children [Roles: admin, parent, cadre, midwife]',
        security: SECURITY_AUTH,
        request: { query: getChildrenQuerySchema },
        responses: {
            200: { description: 'Success get list of children' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Insufficient permissions' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/childrens/{public_id}',
        tags: CHILD_TAG,
        summary:
            'Get child by public ID [Roles: admin, parent, cadre, midwife]',
        security: SECURITY_AUTH,
        request: { params: childParamsSchema },
        responses: {
            200: { description: 'Success get child detail' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Insufficient permissions' },
            404: { description: 'Child not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/childrens/{public_id}',
        tags: CHILD_TAG,
        summary: 'Update child data [Roles: admin, parent, cadre, midwife]',
        security: SECURITY_AUTH,
        request: {
            params: childParamsSchema,
            body: {
                content: { 'application/json': { schema: updateChildSchema } }
            }
        },
        responses: {
            200: { description: 'Child updated successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Insufficient permissions' },
            400: { description: 'Validation error' },
            404: { description: 'Child not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/childrens/{public_id}',
        tags: CHILD_TAG,
        summary: 'Delete child [Roles: admin, parent, cadre, midwife]',
        security: SECURITY_AUTH,
        request: { params: childParamsSchema, query: deleteChildQuerySchema },
        responses: {
            200: { description: 'Child deleted successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Insufficient permissions' },
            404: { description: 'Child not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/childrens/{public_id}/restore',
        tags: CHILD_TAG,
        summary:
            'Restore soft-deleted child [Roles: admin, parent, cadre, midwife]',
        security: SECURITY_AUTH,
        request: { params: childParamsSchema },
        responses: {
            200: { description: 'Child restored successfully' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden - Insufficient permissions' },
            404: { description: 'Child not found' }
        }
    })
}
