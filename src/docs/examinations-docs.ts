import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createExaminationSchema,
    updateExaminationSchema,
    getExaminationsQuerySchema,
    examinationParamsSchema,
    deleteExaminationQuerySchema
} from '@/validations/examinations-validation'

export const registerExaminationsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateExaminationInput', createExaminationSchema)
    registry.register('UpdateExaminationInput', updateExaminationSchema)

    const TAG = ['Examinations']

    registry.registerPath({
        method: 'post',
        path: '/api/examinations',
        tags: TAG,
        summary:
            'Create a new examination template [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createExaminationSchema }
                }
            }
        },
        responses: {
            201: { description: 'Examination template created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/examinations',
        tags: TAG,
        summary:
            'Get list of examination templates [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getExaminationsQuerySchema },
        responses: {
            200: {
                description: 'Success retrieve list of examination templates'
            }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/examinations/{public_id}',
        tags: TAG,
        summary:
            'Get examination template by ID [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { params: examinationParamsSchema },
        responses: {
            200: { description: 'Success get examination template detail' },
            404: { description: 'Examination template not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/examinations/{public_id}',
        tags: TAG,
        summary:
            'Update examination template [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: examinationParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateExaminationSchema }
                }
            }
        },
        responses: {
            200: { description: 'Examination template updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Examination template not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/examinations/{public_id}',
        tags: TAG,
        summary:
            'Delete examination template [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: examinationParamsSchema,
            query: deleteExaminationQuerySchema
        },
        responses: {
            200: { description: 'Examination template deleted successfully' },
            404: { description: 'Examination template not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/examinations/{public_id}/restore',
        tags: TAG,
        summary:
            'Restore soft-deleted examination template [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: { params: examinationParamsSchema },
        responses: {
            200: { description: 'Examination template restored successfully' },
            404: { description: 'Examination template not found' }
        }
    })
}
