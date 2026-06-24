import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createEducationSchema,
    updateEducationSchema,
    getEducationsQuerySchema,
    educationParamsSchema,
    deleteEducationQuerySchema
} from '@/validations/educations-validation'

export const registerEducationsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateEducationInput', createEducationSchema)
    registry.register('UpdateEducationInput', updateEducationSchema)

    const EDU_TAG = ['Educations']

    registry.registerPath({
        method: 'post',
        path: '/api/educations',
        tags: EDU_TAG,
        summary:
            'Create a new education article [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createEducationSchema }
                }
            }
        },
        responses: {
            201: { description: 'Education article created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/educations',
        tags: EDU_TAG,
        summary:
            'Get list of education articles [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getEducationsQuerySchema },
        responses: {
            200: { description: 'Success get list of education articles' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/educations/{public_id}',
        tags: EDU_TAG,
        summary:
            'Get education article by public ID [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { params: educationParamsSchema },
        responses: {
            200: { description: 'Success get education article detail' },
            404: { description: 'Education article not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/educations/{public_id}',
        tags: EDU_TAG,
        summary:
            'Update education article data [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: educationParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateEducationSchema }
                }
            }
        },
        responses: {
            200: { description: 'Education article updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Education article not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/educations/{public_id}',
        tags: EDU_TAG,
        summary:
            'Delete education article [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: educationParamsSchema,
            query: deleteEducationQuerySchema
        },
        responses: {
            200: { description: 'Education article deleted successfully' },
            404: { description: 'Education article not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/educations/{public_id}/restore',
        tags: EDU_TAG,
        summary:
            'Restore soft-deleted education article [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: { params: educationParamsSchema },
        responses: {
            200: { description: 'Education article restored successfully' },
            404: { description: 'Education article not found' }
        }
    })
}
