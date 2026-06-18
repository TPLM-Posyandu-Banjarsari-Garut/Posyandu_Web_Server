import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createExaminationRecordSchema,
    updateExaminationRecordSchema,
    getExaminationRecordsQuerySchema,
    examinationRecordParamsSchema,
    deleteExaminationRecordQuerySchema
} from '@/validations/examination-records-validation'

export const registerExaminationRecordsRoutes = (registry: OpenAPIRegistry) => {
    registry.register(
        'CreateExaminationRecordInput',
        createExaminationRecordSchema
    )
    registry.register(
        'UpdateExaminationRecordInput',
        updateExaminationRecordSchema
    )

    const TAG = ['Examination Records']

    registry.registerPath({
        method: 'post',
        path: '/api/examination-records',
        tags: TAG,
        summary:
            'Create a new examination record [Roles: admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: createExaminationRecordSchema
                    }
                }
            }
        },
        responses: {
            201: { description: 'Examination record created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/examination-records',
        tags: TAG,
        summary:
            'Get list of examination records [Roles: admin, midwife, cadre, parent]',
        request: { query: getExaminationRecordsQuerySchema },
        responses: {
            200: { description: 'Success retrieve list of examination records' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/examination-records/{public_id}',
        tags: TAG,
        summary:
            'Get examination record by ID [Roles: admin, midwife, cadre, parent]',
        request: { params: examinationRecordParamsSchema },
        responses: {
            200: { description: 'Success get examination record detail' },
            404: { description: 'Examination record not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/examination-records/{public_id}',
        tags: TAG,
        summary: 'Update examination record [Roles: admin, midwife, cadre]',
        request: {
            params: examinationRecordParamsSchema,
            body: {
                content: {
                    'application/json': {
                        schema: updateExaminationRecordSchema
                    }
                }
            }
        },
        responses: {
            200: { description: 'Examination record updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Examination record not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/examination-records/{public_id}',
        tags: TAG,
        summary: 'Delete examination record [Roles: admin, midwife, cadre]',
        request: {
            params: examinationRecordParamsSchema,
            query: deleteExaminationRecordQuerySchema
        },
        responses: {
            200: { description: 'Examination record deleted successfully' },
            404: { description: 'Examination record not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/examination-records/{public_id}/restore',
        tags: TAG,
        summary:
            'Restore soft-deleted examination record [Roles: admin, midwife, cadre]',
        request: { params: examinationRecordParamsSchema },
        responses: {
            200: { description: 'Examination record restored successfully' },
            404: { description: 'Examination record not found' }
        }
    })
}
