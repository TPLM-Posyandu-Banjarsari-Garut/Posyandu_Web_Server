import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createVaccineSchema,
    updateVaccineSchema,
    getVaccinesQuerySchema,
    vaccineParamsSchema,
    deleteVaccineQuerySchema
} from '@/validations/vaccines-validation'

export const registerVaccinesRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateVaccineInput', createVaccineSchema)
    registry.register('UpdateVaccineInput', updateVaccineSchema)

    const VAC_TAG = ['Vaccines']

    registry.registerPath({
        method: 'post',
        path: '/api/vaccines',
        tags: VAC_TAG,
        summary: 'Create a new vaccine [Roles: admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createVaccineSchema }
                }
            }
        },
        responses: {
            201: { description: 'Vaccine created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/vaccines',
        tags: VAC_TAG,
        summary: 'Get list of vaccines [Roles: admin, midwife, cadre, parent]',
        request: { query: getVaccinesQuerySchema },
        responses: {
            200: { description: 'Success get list of vaccines' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/vaccines/{public_id}',
        tags: VAC_TAG,
        summary:
            'Get vaccine by public ID [Roles: admin, midwife, cadre, parent]',
        request: { params: vaccineParamsSchema },
        responses: {
            200: { description: 'Success get vaccine detail' },
            404: { description: 'Vaccine not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/vaccines/{public_id}',
        tags: VAC_TAG,
        summary: 'Update vaccine data [Roles: admin, midwife, cadre]',
        request: {
            params: vaccineParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateVaccineSchema }
                }
            }
        },
        responses: {
            200: { description: 'Vaccine updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Vaccine not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/vaccines/{public_id}',
        tags: VAC_TAG,
        summary: 'Delete vaccine [Roles: admin, midwife, cadre]',
        request: {
            params: vaccineParamsSchema,
            query: deleteVaccineQuerySchema
        },
        responses: {
            200: { description: 'Vaccine deleted successfully' },
            404: { description: 'Vaccine not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/vaccines/{public_id}/restore',
        tags: VAC_TAG,
        summary: 'Restore soft-deleted vaccine [Roles: admin, midwife, cadre]',
        request: { params: vaccineParamsSchema },
        responses: {
            200: { description: 'Vaccine restored successfully' },
            404: { description: 'Vaccine not found' }
        }
    })
}
