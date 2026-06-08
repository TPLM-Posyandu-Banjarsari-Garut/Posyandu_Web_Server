import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createKipiDetailSchema,
    updateKipiDetailSchema,
    getKipiDetailsQuerySchema,
    kipiDetailParamsSchema,
    deleteKipiDetailQuerySchema
} from '@/validations/kipi-details-validation'

export const registerKipiDetailsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateKipiDetailInput', createKipiDetailSchema)
    registry.register('UpdateKipiDetailInput', updateKipiDetailSchema)

    const KIPI_TAG = ['KIPI Details']

    registry.registerPath({
        method: 'post',
        path: '/api/kipi-details',
        tags: KIPI_TAG,
        summary: 'Create a new KIPI detail [Roles: admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': { schema: createKipiDetailSchema }
                }
            }
        },
        responses: {
            201: { description: 'KIPI detail created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/kipi-details',
        tags: KIPI_TAG,
        summary: 'Get list of KIPI details [Roles: admin, midwife, cadre]',
        request: { query: getKipiDetailsQuerySchema },
        responses: {
            200: { description: 'Success get list of KIPI details' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/kipi-details/{public_id}',
        tags: KIPI_TAG,
        summary: 'Get KIPI detail by public ID [Roles: admin, midwife, cadre]',
        request: { params: kipiDetailParamsSchema },
        responses: {
            200: { description: 'Success get KIPI detail' },
            404: { description: 'KIPI detail not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/kipi-details/{public_id}',
        tags: KIPI_TAG,
        summary: 'Update KIPI detail data [Roles: admin, midwife, cadre]',
        request: {
            params: kipiDetailParamsSchema,
            body: {
                content: {
                    'application/json': { schema: updateKipiDetailSchema }
                }
            }
        },
        responses: {
            200: { description: 'KIPI detail updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'KIPI detail not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/kipi-details/{public_id}',
        tags: KIPI_TAG,
        summary: 'Delete KIPI detail [Roles: admin, midwife, cadre]',
        request: {
            params: kipiDetailParamsSchema,
            query: deleteKipiDetailQuerySchema
        },
        responses: {
            200: { description: 'KIPI detail deleted successfully' },
            404: { description: 'KIPI detail not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/kipi-details/{public_id}/restore',
        tags: KIPI_TAG,
        summary:
            'Restore soft-deleted KIPI detail [Roles: admin, midwife, cadre]',
        request: { params: kipiDetailParamsSchema },
        responses: {
            200: { description: 'KIPI detail restored successfully' },
            404: { description: 'KIPI detail not found' }
        }
    })
}
