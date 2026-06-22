import { accountStatusEnum, bloodTypeEnum, parents } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import {
    relationIdSchema,
    paginationQuerySchema,
    deleteQuerySchema
} from './shared-validation'

extendZodWithOpenApi(z)

export const createParentSchema = createInsertSchema(parents, {
    user_id: relationIdSchema('User ID'),

    identity_number: z
        .string()
        .length(16, 'Identity number (NIK) must be exactly 16 characters')
        .optional()
        .nullable()
        .openapi({ example: '320101XXXXXXXXXX' }),

    place_of_birth: z
        .string()
        .max(50, 'Place of birth cannot exceed 50 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Bandung' }),

    date_of_birth: z
        .preprocess(
            arg =>
                typeof arg === 'string' || arg instanceof Date
                    ? new Date(arg)
                    : arg,
            z.date()
        )
        .optional()
        .nullable()
        .openapi({ type: 'string', format: 'date', example: '1990-01-01' }),

    blood_type: z
        .enum(bloodTypeEnum.enumValues)
        .optional()
        .nullable()
        .openapi({ example: 'O' }),

    education: z
        .string()
        .max(50, 'Education cannot exceed 50 characters')
        .optional()
        .nullable()
        .openapi({ example: 'S1 Teknik Informatika' }),

    occupation: z
        .string()
        .max(50, 'Occupation cannot exceed 50 characters')
        .optional()
        .nullable()
        .openapi({ example: 'Karyawan Swasta' }),

    address_line: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Jl. Merdeka No. 45' }),

    rt: z
        .string()
        .max(5, 'RT cannot exceed 5 characters')
        .optional()
        .nullable()
        .openapi({ example: '003' }),

    rw: z
        .string()
        .max(5, 'RW cannot exceed 5 characters')
        .optional()
        .nullable()
        .openapi({ example: '005' }),

    village_name: z
        .string()
        .max(100, 'Village name cannot exceed 100 characters')
        .default('Banjarsari')
        .openapi({ example: 'Banjarsari' }),

    status: z.enum(accountStatusEnum.enumValues).default('active')
})
    .omit({
        is_deleted: true,
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateParentInput')

export const getParentsQuerySchema = z
    .object({
        ...paginationQuerySchema,

        user_id: z.string().optional().openapi({ example: 'user-id-uuid' }),

        blood_type: z.enum(bloodTypeEnum.enumValues).optional(),
        status: z.enum(accountStatusEnum.enumValues).optional(),
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
    .openapi('GetParentsQuery')

export const parentParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'parent-xyz-123' })
    })
    .openapi('ParentParams')

export const deleteParentQuerySchema = deleteQuerySchema

export const updateParentSchema = createParentSchema
    .partial()
    .openapi('UpdateParentInput')

export type CreateParentInput = z.infer<typeof createParentSchema>
export type UpdateParentInput = z.infer<typeof updateParentSchema>
export type GetParentsQueryInput = z.infer<typeof getParentsQuerySchema>
export type ParentParamInput = z.infer<typeof parentParamsSchema>
export type DeleteParentQueryInput = z.infer<typeof deleteParentQuerySchema>
