import { bloodTypeEnum, childCategoryEnum, genderEnum, childrens } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createChildSchema = createInsertSchema(childrens, {
    posyandu_id: z
        .number('Posyandu ID must be a number')
        .int()
        .positive()
        .openapi({ example: 1 }),

    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name cannot exceed 100 characters')
        .openapi({ example: 'Ananda Pratama' }),

    identity_number: z
        .string()
        .length(
            16,
            'Identity number (NIK/No. KIA) must be exactly 16 characters'
        )
        .openapi({ example: '320101XXXXXXXXXX' }),

    gender: z.enum(genderEnum.enumValues).openapi({ example: 'L' }),

    child_category: z.enum(childCategoryEnum.enumValues).optional().nullable(),

    place_of_birth: z
        .string()
        .max(100, 'Place of birth cannot exceed 100 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Bandung' }),

    birth_date: z
        .preprocess(
            arg =>
                typeof arg === 'string' || arg instanceof Date
                    ? new Date(arg)
                    : arg,
            z.date()
        )
        .optional()
        .nullable()
        .openapi({ type: 'string', format: 'date', example: '2024-05-20' }),

    birth_order: z
        .number()
        .int()
        .positive()
        .optional()
        .nullable()
        .openapi({ example: 1 }),

    blood_type: z
        .enum(bloodTypeEnum.enumValues)
        .optional()
        .nullable()
        .openapi({ example: 'A' }),

    birth_weight: z
        .string()
        .regex(
            /^\d{1,3}(\.\d{1,2})?$/,
            'Invalid weight format (max 5 digits, 2 decimal places)'
        )
        .optional()
        .nullable()
        .openapi({ type: 'string', example: '3.25' }),

    birth_length: z
        .string()
        .regex(
            /^\d{1,3}(\.\d{1,2})?$/,
            'Invalid length format (max 5 digits, 2 decimal places)'
        )
        .optional()
        .nullable()
        .openapi({ type: 'string', example: '50.5' }),

    birth_head_circumference: z
        .string()
        .regex(
            /^\d{1,3}(\.\d{1,2})?$/,
            'Invalid head circumference format (max 5 digits, 2 decimal places)'
        )
        .optional()
        .nullable()
        .openapi({ type: 'string', example: '34.2' })
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateChildInput')

export const getChildrenQuerySchema = z
    .object({
        page: z
            .string()
            .optional()
            .default('1')
            .transform(val => Number.parseInt(val, 10))
            .openapi({ type: 'string', default: '1', example: '1' }),

        limit: z
            .string()
            .optional()
            .default('10')
            .transform(val => Number.parseInt(val, 10))
            .openapi({ type: 'string', default: '10', example: '10' }),

        posyandu_id: z
            .string()
            .optional()
            .transform(val => (val ? Number.parseInt(val, 10) : undefined))
            .openapi({ type: 'string', example: '1' }),

        gender: z.enum(genderEnum.enumValues).optional(),
        child_category: z.enum(childCategoryEnum.enumValues).optional(),
        search: z.string().optional(),
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
    .openapi('GetChildrenQuery')

export const childParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'child-xyz-123' })
    })
    .openapi('ChildParams')

export const deleteChildQuerySchema = z
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
    .openapi('DeleteChildQuery')

export const updateChildSchema = createChildSchema
    .partial()
    .openapi('UpdateChildInput')

export type CreateChildInput = z.infer<typeof createChildSchema>
export type UpdateChildInput = z.infer<typeof updateChildSchema>
export type GetChildrenQueryInput = z.infer<typeof getChildrenQuerySchema>
export type ChildParamInput = z.infer<typeof childParamsSchema>
export type DeleteChildQueryInput = z.infer<typeof deleteChildQuerySchema>
