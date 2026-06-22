import { educationCategories, statusEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createEducationCategorySchema = createInsertSchema(
    educationCategories,
    {
        name: z
            .string()
            .min(3, 'Name must be at least 3 characters')
            .max(100, 'Name cannot exceed 100 characters')
            .openapi({ example: 'Kesehatan Ibu & Anak' }),

        slug: z
            .string()
            .min(3, 'Slug must be at least 3 characters')
            .max(120, 'Slug cannot exceed 120 characters')
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                'Slug must be lowercase alphanumeric and can contain hyphens'
            )
            .openapi({ example: 'kesehatan-ibu-anak' }),

        description: z.string().optional().nullable().openapi({
            example: 'Edukasi terkait kesehatan ibu hamil dan balita'
        }),

        status: z.enum(statusEnum.enumValues).default('active')
    }
)
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateEducationCategoryInput')

export const getEducationCategoriesQuerySchema = z
    .object({
        ...paginationQuerySchema,

        search: z.string().optional(),
        status: z.enum(statusEnum.enumValues).optional(),
        includeDeleted: z
            .string()
            .optional()
            .transform(val => val === 'true')
            .openapi({
                type: 'string',
                enum: ['true', 'false'],
                example: 'false'
            })
    })
    .openapi('GetEducationCategoriesQuery')

export const educationCategoryParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'cat-xyz-123' })
    })
    .openapi('EducationCategoryParams')

export const deleteEducationCategoryQuerySchema = z
    .object({
        permanent: z
            .string()
            .optional()
            .transform(val => val === 'true')
            .openapi({
                type: 'string',
                enum: ['true', 'false'],
                example: 'false'
            })
    })
    .openapi('DeleteEducationCategoryQuery')

export const updateEducationCategorySchema = createEducationCategorySchema
    .partial()
    .openapi('UpdateEducationCategoryInput')

export type CreateEducationCategoryInput = z.infer<
    typeof createEducationCategorySchema
>
export type UpdateEducationCategoryInput = z.infer<
    typeof updateEducationCategorySchema
>
export type GetEducationCategoriesQueryInput = z.infer<
    typeof getEducationCategoriesQuerySchema
>
export type EducationCategoryParamInput = z.infer<
    typeof educationCategoryParamsSchema
>
export type DeleteEducationCategoryQueryInput = z.infer<
    typeof deleteEducationCategoryQuerySchema
>
