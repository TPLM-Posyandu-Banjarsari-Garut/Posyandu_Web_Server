import { educations, statusEnum } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createEducationSchema = createInsertSchema(educations, {
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .openapi({ example: 'Cara Mencegah Stunting pada Balita' }),

    content: z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .openapi({ example: '<p>Stunting adalah kondisi gagal tumbuh...</p>' }),

    summary: z
        .string()
        .max(500, 'Summary cannot exceed 500 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Panduan lengkap tentang pencegahan stunting.' }),

    image_url: z
        .url('Must be a valid URL')
        .optional()
        .nullable()
        .openapi({ example: 'https://example.com/images/stunting.jpg' }),

    category_id: z
        .string()
        .min(1, 'Category ID is required')
        .openapi({ example: 'cat-123' }),

    views_count: z.number().int().min(0).default(0).openapi({ example: 0 }),

    read_time: z.number().int().min(1).default(1).openapi({ example: 5 }),

    posyandu_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'pos-123' }),

    created_by_user_id: z
        .string()
        .min(1, 'Created by user ID is required')
        .openapi({ example: 'usr-123' }),

    status: z.enum(statusEnum.enumValues).default('active')
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateEducationInput')

export const getEducationsQuerySchema = z
    .object({
        ...paginationQuerySchema,

        search: z.string().optional(),
        category_id: z.string().optional(),
        posyandu_id: z.string().optional(),
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
    .openapi('GetEducationsQuery')

export const educationParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'edu-xyz-123' })
    })
    .openapi('EducationParams')

export const deleteEducationQuerySchema = z
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
    .openapi('DeleteEducationQuery')

export const updateEducationSchema = createEducationSchema
    .partial()
    .openapi('UpdateEducationInput')

export type CreateEducationInput = z.infer<typeof createEducationSchema>
export type UpdateEducationInput = z.infer<typeof updateEducationSchema>
export type GetEducationsQueryInput = z.infer<typeof getEducationsQuerySchema>
export type EducationParamInput = z.infer<typeof educationParamsSchema>
export type DeleteEducationQueryInput = z.infer<
    typeof deleteEducationQuerySchema
>
