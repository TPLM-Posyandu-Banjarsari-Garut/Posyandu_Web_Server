import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createNutritionRecordSchema,
    updateNutritionRecordSchema,
    getNutritionRecordsQuerySchema,
    nutritionRecordParamsSchema,
    deleteNutritionRecordQuerySchema
} from '@/validations/nutrition-records-validation'

export const registerNutritionRecordsRoutes = (registry: OpenAPIRegistry) => {
    registry.register('CreateNutritionRecordInput', createNutritionRecordSchema)
    registry.register('UpdateNutritionRecordInput', updateNutritionRecordSchema)

    const NUT_TAG = ['Nutrition Records']

    registry.registerPath({
        method: 'post',
        path: '/api/nutrition-records',
        tags: NUT_TAG,
        summary:
            'Create a new nutrition record [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: createNutritionRecordSchema
                    }
                }
            }
        },
        responses: {
            201: { description: 'Nutrition record created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/nutrition-records',
        tags: NUT_TAG,
        summary:
            'Get list of nutrition records [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getNutritionRecordsQuerySchema },
        responses: {
            200: { description: 'Success get list of nutrition records' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/nutrition-records/{public_id}',
        tags: NUT_TAG,
        summary:
            'Get nutrition record by public ID [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { params: nutritionRecordParamsSchema },
        responses: {
            200: { description: 'Success get nutrition record detail' },
            404: { description: 'Nutrition record not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/nutrition-records/{public_id}',
        tags: NUT_TAG,
        summary:
            'Update nutrition record data [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: nutritionRecordParamsSchema,
            body: {
                content: {
                    'application/json': {
                        schema: updateNutritionRecordSchema
                    }
                }
            }
        },
        responses: {
            200: { description: 'Nutrition record updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Nutrition record not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/nutrition-records/{public_id}',
        tags: NUT_TAG,
        summary:
            'Delete nutrition record [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: nutritionRecordParamsSchema,
            query: deleteNutritionRecordQuerySchema
        },
        responses: {
            200: { description: 'Nutrition record deleted successfully' },
            404: { description: 'Nutrition record not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/nutrition-records/{public_id}/restore',
        tags: NUT_TAG,
        summary:
            'Restore soft-deleted nutrition record [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: { params: nutritionRecordParamsSchema },
        responses: {
            200: { description: 'Nutrition record restored successfully' },
            404: { description: 'Nutrition record not found' }
        }
    })
}
