import { bloodTypeEnum, parents } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createParentSchema = createInsertSchema(parents, {
    user_id: z.number('User ID must be a number').int().positive(),

    identitiy_number: z
        .string()
        .max(16, 'Identity number (NIK) cannot exceed 16 characters')
        .optional()
        .nullable(),
    place_of_birth: z
        .string()
        .max(50, 'Place of birth cannot exceed 50 characters')
        .optional()
        .nullable(),
    date_of_birth: z.coerce.date().optional().nullable(),

    blood_type: z.enum(bloodTypeEnum.enumValues).optional().nullable(),
    education: z
        .string()
        .max(50, 'Education cannot exceed 50 characters')
        .optional()
        .nullable(),
    occupation: z
        .string()
        .max(50, 'Occupation cannot exceed 50 characters')
        .optional()
        .nullable(),

    address_line: z.string().optional().nullable(),
    rt: z
        .string()
        .max(5, 'RT cannot exceed 5 characters')
        .optional()
        .nullable(),
    rw: z
        .string()
        .max(5, 'RW cannot exceed 5 characters')
        .optional()
        .nullable(),
    village_name: z
        .string()
        .max(100, 'Village name cannot exceed 100 characters')
        .default('Banjarsari')
}).omit({
    id: true,
    public_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true
})

export const getParentsQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .default('1')
        .transform(val => Number.parseInt(val, 10)),

    limit: z
        .string()
        .optional()
        .default('10')
        .transform(val => Number.parseInt(val, 10)),

    user_id: z
        .string()
        .optional()
        .transform(val => (val ? Number.parseInt(val, 10) : undefined)),

    search: z.string().optional(),
    blood_type: z.enum(bloodTypeEnum.enumValues).optional()
})

export const parentParamsSchema = z.object({
    public_id: z.string().min(1, 'Public ID is required')
})

export const updateParentSchema = createParentSchema.partial()

export type CreateParentInput = z.infer<typeof createParentSchema>
export type UpdateParentInput = z.infer<typeof updateParentSchema>
export type GetParentsQueryInput = z.infer<typeof getParentsQuerySchema>
export type ParentParamInput = z.infer<typeof parentParamsSchema>
