import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    createEducationCategorySchema,
    updateEducationCategorySchema,
    getEducationCategoriesQuerySchema,
    educationCategoryParamsSchema,
    deleteEducationCategoryQuerySchema
} from '@/validations/education-categories-validation'

export const registerEducationCategoriesRoutes = (
    registry: OpenAPIRegistry
) => {
    registry.register(
        'CreateEducationCategoryInput',
        createEducationCategorySchema
    )
    registry.register(
        'UpdateEducationCategoryInput',
        updateEducationCategorySchema
    )

    const CAT_TAG = ['Education Categories']

    registry.registerPath({
        method: 'post',
        path: '/api/education-categories',
        tags: CAT_TAG,
        summary:
            'Create a new education category [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: createEducationCategorySchema
                    }
                }
            }
        },
        responses: {
            201: { description: 'Category created successfully' },
            400: { description: 'Validation error' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/education-categories',
        tags: CAT_TAG,
        summary:
            'Get list of education categories [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { query: getEducationCategoriesQuerySchema },
        responses: {
            200: { description: 'Success get list of categories' }
        }
    })

    registry.registerPath({
        method: 'get',
        path: '/api/education-categories/{public_id}',
        tags: CAT_TAG,
        summary:
            'Get category by public ID [Roles: posyandu_admin, village_admin, midwife, cadre, parent]',
        request: { params: educationCategoryParamsSchema },
        responses: {
            200: { description: 'Success get category detail' },
            404: { description: 'Category not found' }
        }
    })

    registry.registerPath({
        method: 'put',
        path: '/api/education-categories/{public_id}',
        tags: CAT_TAG,
        summary:
            'Update category data [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: educationCategoryParamsSchema,
            body: {
                content: {
                    'application/json': {
                        schema: updateEducationCategorySchema
                    }
                }
            }
        },
        responses: {
            200: { description: 'Category updated successfully' },
            400: { description: 'Validation error' },
            404: { description: 'Category not found' }
        }
    })

    registry.registerPath({
        method: 'delete',
        path: '/api/education-categories/{public_id}',
        tags: CAT_TAG,
        summary:
            'Delete category [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: {
            params: educationCategoryParamsSchema,
            query: deleteEducationCategoryQuerySchema
        },
        responses: {
            200: { description: 'Category deleted successfully' },
            404: { description: 'Category not found' }
        }
    })

    registry.registerPath({
        method: 'post',
        path: '/api/education-categories/{public_id}/restore',
        tags: CAT_TAG,
        summary:
            'Restore soft-deleted category [Roles: posyandu_admin, village_admin, midwife, cadre]',
        request: { params: educationCategoryParamsSchema },
        responses: {
            200: { description: 'Category restored successfully' },
            404: { description: 'Category not found' }
        }
    })
}
