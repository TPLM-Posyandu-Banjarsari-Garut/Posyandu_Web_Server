import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createVitaminRecordSchema,
    updateVitaminRecordSchema,
    getVitaminRecordsQuerySchema,
    vitaminRecordParamsSchema,
    deleteVitaminRecordQuerySchema
} from '@/validations/vitamin-records-validation'

export const registerVitaminRecordsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateVitaminRecordInput', createVitaminRecordSchema)
    registry.register('UpdateVitaminRecordInput', updateVitaminRecordSchema)

    const VIT_REC_TAG = ['Vitamin Records']

    registry.registerPath({
        method: 'post',
        path: '/api/vitamin-records',
        tags: VIT_REC_TAG,
        summary:
            'Create a new vitamin record [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createVitaminRecordSchema }
                }
            }
        },
        responses: {
            201: { description: 'Vitamin record created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/vitamin-records',
        tags: VIT_REC_TAG,
        summary:
            'Get list of vitamin records [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getVitaminRecordsQuerySchema },
        responses: {
            200: { description: 'Success get list of vitamin records' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/vitamin-records/{public_id}',
        tags: VIT_REC_TAG,
        summary:
            'Get vitamin record by public ID [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { params: vitaminRecordParamsSchema },
        responses: {
            200: { description: 'Success get vitamin record detail' },
            404: { description: 'Vitamin record not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/vitamin-records/{public_id}',
        tags: VIT_REC_TAG,
        summary:
            'Update vitamin record data [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: vitaminRecordParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateVitaminRecordSchema }
                }
            }
        },
        responses: {
            200: { description: 'Vitamin record updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Vitamin record not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/vitamin-records/{public_id}',
        tags: VIT_REC_TAG,
        summary:
            'Delete vitamin record [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: vitaminRecordParamsSchema,
            query: deleteVitaminRecordQuerySchema
        },
        responses: {
            200: { description: 'Vitamin record deleted successfully' },
            404: { description: 'Vitamin record not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/vitamin-records/{public_id}/restore',
        tags: VIT_REC_TAG,
        summary:
            'Restore soft-deleted vitamin record [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: { params: vitaminRecordParamsSchema },
        responses: {
            200: { description: 'Vitamin record restored successfully' },
            404: { description: 'Vitamin record not found' }
        }
    })
}
