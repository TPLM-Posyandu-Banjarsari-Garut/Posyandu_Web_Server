import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createPregnancyRecordSchema,
    updatePregnancyRecordSchema,
    getPregnancyRecordsQuerySchema,
    pregnancyRecordParamsSchema,
    deletePregnancyRecordQuerySchema
} from '@/validations/pregnancy-records-validation'

export const registerPregnancyRecordsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreatePregnancyRecordInput', createPregnancyRecordSchema)
    registry.register('UpdatePregnancyRecordInput', updatePregnancyRecordSchema)

    const TAG = ['Pregnancy Records']

    registry.registerPath({
        method: 'post',
        path: '/api/pregnancy-records',
        tags: TAG,
        summary: 'Create a new pregnancy record [Roles: admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createPregnancyRecordSchema }
                }
            }
        },
        responses: {
            201: { description: 'Pregnancy record created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/pregnancy-records',
        tags: TAG,
        summary:
            'Get list of pregnancy records [Roles: admin, midwife, cadre, parent]',
        request: { query: getPregnancyRecordsQuerySchema },
        responses: {
            200: { description: 'Success retrieve list of pregnancy records' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/pregnancy-records/{public_id}',
        tags: TAG,
        summary:
            'Get pregnancy record by public ID [Roles: admin, midwife, cadre, parent]',
        request: { params: pregnancyRecordParamsSchema },
        responses: {
            200: { description: 'Success get pregnancy record detail' },
            404: { description: 'Pregnancy record not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/pregnancy-records/{public_id}',
        tags: TAG,
        summary: 'Update pregnancy record [Roles: admin, midwife, cadre]',
        request: {
            params: pregnancyRecordParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updatePregnancyRecordSchema }
                }
            }
        },
        responses: {
            200: { description: 'Pregnancy record updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Pregnancy record not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/pregnancy-records/{public_id}',
        tags: TAG,
        summary: 'Delete pregnancy record [Roles: admin, midwife, cadre]',
        request: {
            params: pregnancyRecordParamsSchema,
            query: deletePregnancyRecordQuerySchema
        },
        responses: {
            200: { description: 'Pregnancy record deleted successfully' },
            404: { description: 'Pregnancy record not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/pregnancy-records/{public_id}/restore',
        tags: TAG,
        summary:
            'Restore soft-deleted pregnancy record [Roles: admin, midwife, cadre]',
        request: { params: pregnancyRecordParamsSchema },
        responses: {
            200: { description: 'Pregnancy record restored successfully' },
            404: { description: 'Pregnancy record not found' }
        }
    })
}
