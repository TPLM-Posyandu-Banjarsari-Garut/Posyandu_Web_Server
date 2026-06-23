import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createConsultationSchema,
    updateConsultationSchema,
    updateConsultationStatusSchema,
    getConsultationsQuerySchema,
    consultationParamsSchema,
    deleteConsultationQuerySchema,
    getAvailableSlotsQuerySchema
} from '@/validations/consultations-validation'

export const registerConsultationsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateConsultationInput', createConsultationSchema)
    registry.register('UpdateConsultationInput', updateConsultationSchema)
    registry.register(
        'UpdateConsultationStatusInput',
        updateConsultationStatusSchema
    )
    registry.register('GetAvailableSlotsQuery', getAvailableSlotsQuerySchema)

    const TAG = ['Consultations']

    registry.registerPath({
        method: 'post',
        path: '/api/consultations',
        tags: TAG,
        summary:
            'Create a new consultation booking [Roles: posyandu_admin, village_admin, parent]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createConsultationSchema }
                }
            }
        },
        responses: {
            201: { description: 'Consultation booking created successfully' },
            400: { description: 'Validation error / Slot unavailable' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/consultations',
        tags: TAG,
        summary:
            'Get list of consultations [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getConsultationsQuerySchema },
        responses: {
            200: { description: 'Success retrieve list of consultations' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/consultations/slots/available',
        tags: TAG,
        summary:
            'Get available time slots [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getAvailableSlotsQuerySchema },
        responses: {
            200: { description: 'Success retrieve available time slots' },
            400: { description: 'Invalid query parameters' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/consultations/{public_id}',
        tags: TAG,
        summary:
            'Get consultation by public ID [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { params: consultationParamsSchema },
        responses: {
            200: { description: 'Success get consultation detail' },
            404: { description: 'Consultation not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/consultations/{public_id}',
        tags: TAG,
        summary:
            'Update consultation booking [Roles: posyandu_admin, village_admin, parent]',
        request: {
            params: consultationParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateConsultationSchema }
                }
            }
        },
        responses: {
            200: { description: 'Consultation updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Consultation not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/consultations/{public_id}/status',
        tags: TAG,
        summary:
            'Update consultation status [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: {
            params: consultationParamsSchema,
            body: {
                content: {
                    'application/json': {
                        schema: updateConsultationStatusSchema
                    }
                }
            }
        },
        responses: {
            200: { description: 'Status updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Consultation not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/consultations/{public_id}',
        tags: TAG,
        summary:
            'Delete consultation [Roles: posyandu_admin, village_admin, parent]',
        request: {
            params: consultationParamsSchema,
            query: deleteConsultationQuerySchema
        },
        responses: {
            200: { description: 'Consultation deleted successfully' },
            404: { description: 'Consultation not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/consultations/{public_id}/restore',
        tags: TAG,
        summary:
            'Restore soft-deleted consultation [Roles: posyandu_admin, village_admin, parent]',
        request: { params: consultationParamsSchema },
        responses: {
            200: { description: 'Consultation restored successfully' },
            404: { description: 'Consultation not found' }
        }
    })
}
