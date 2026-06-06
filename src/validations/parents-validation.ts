import { accountStatusEnum, bloodTypeEnum, parents } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createParentSchema = createInsertSchema(parents, {
    user_id: z
        .number('User ID must be a number')
        .int()
        .positive()
        .openapi({ example: 4 }),

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
        id: true,
        public_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateParentInput')

export const getParentsQuerySchema = z
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

        user_id: z
            .string()
            .optional()
            .transform(val => (val ? Number.parseInt(val, 10) : undefined))
            .openapi({ type: 'string', example: '4' }),

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

export const deleteParentQuerySchema = z
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
    .openapi('DeleteParentQuery')

export const updateParentSchema = createParentSchema
    .partial()
    .openapi('UpdateParentInput')

export type CreateParentInput = z.infer<typeof createParentSchema>
export type UpdateParentInput = z.infer<typeof updateParentSchema>
export type GetParentsQueryInput = z.infer<typeof getParentsQuerySchema>
export type ParentParamInput = z.infer<typeof parentParamsSchema>
export type DeleteParentQueryInput = z.infer<typeof deleteParentQuerySchema>
