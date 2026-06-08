import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createImmunizationRecordSchema,
    updateImmunizationRecordSchema,
    getImmunizationRecordsQuerySchema,
    immunizationRecordParamsSchema,
    deleteImmunizationRecordQuerySchema
} from '@/validations/immunization-records-validation'

export const registerImmunizationRecordsRoutes = (
    registry: OpenAPIRegistry
) => {
    registry.register(
        'CreateImmunizationRecordInput',
        createImmunizationRecordSchema
    )
    registry.register(
        'UpdateImmunizationRecordInput',
        updateImmunizationRecordSchema
    )

    const IMM_TAG = ['Immunization Records']

    registry.registerPath({
        method: 'post',
        path: '/api/immunization-records',
        tags: IMM_TAG,
        summary:
            'Create a new immunization record [Roles: admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: createImmunizationRecordSchema
                    }
                }
            }
        },
        responses: {
            201: { description: 'Immunization record created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/immunization-records',
        tags: IMM_TAG,
        summary:
            'Get list of immunization records [Roles: admin, midwife, cadre, parent]',
        request: { query: getImmunizationRecordsQuerySchema },
        responses: {
            200: { description: 'Success get list of immunization records' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/immunization-records/{public_id}',
        tags: IMM_TAG,
        summary:
            'Get immunization record by public ID [Roles: admin, midwife, cadre, parent]',
        request: { params: immunizationRecordParamsSchema },
        responses: {
            200: { description: 'Success get immunization record detail' },
            404: { description: 'Immunization record not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/immunization-records/{public_id}',
        tags: IMM_TAG,
        summary:
            'Update immunization record data [Roles: admin, midwife, cadre]',
        request: {
            params: immunizationRecordParamsSchema,
            body: {
                content: {
                    'application/json': {
                        schema: updateImmunizationRecordSchema
                    }
                }
            }
        },
        responses: {
            200: { description: 'Immunization record updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Immunization record not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/immunization-records/{public_id}',
        tags: IMM_TAG,
        summary: 'Delete immunization record [Roles: admin, midwife, cadre]',
        request: {
            params: immunizationRecordParamsSchema,
            query: deleteImmunizationRecordQuerySchema
        },
        responses: {
            200: { description: 'Immunization record deleted successfully' },
            404: { description: 'Immunization record not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/immunization-records/{public_id}/restore',
        tags: IMM_TAG,
        summary:
            'Restore soft-deleted immunization record [Roles: admin, midwife, cadre]',
        request: { params: immunizationRecordParamsSchema },
        responses: {
            200: { description: 'Immunization record restored successfully' },
            404: { description: 'Immunization record not found' }
        }
    })
}
