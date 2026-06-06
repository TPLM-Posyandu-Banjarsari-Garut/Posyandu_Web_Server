import { accountStatusEnum, midwifes } from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createMidwifeSchema = createInsertSchema(midwifes, {
    user_id: z.number('User ID must be a number').int().positive(),

    posyandu_id: z.number('Posyandu ID must be a number').int().positive(),

    identity_number: z
        .string()
        .min(16, 'Identity number (NIK) must be exactly 16 characters')
        .max(16, 'Identity number (NIK) must be exactly 16 characters'),

    employee_number: z
        .string()
        .max(32, 'Employee number (NIP) cannot exceed 32 characters')
        .optional()
        .nullable(),

    license_number: z
        .string()
        .max(50, 'STR number cannot exceed 50 characters')
        .optional()
        .nullable(),

    is_mtbs_trained: z.boolean().default(false),
    is_kelas_ibu_balita_facilitator: z.boolean().default(false),
    is_pkat_member: z.boolean().default(false),
    is_poned_provider: z.boolean().default(false),

    is_primary_assignment: z.boolean().default(true),
    duty_area_notes: z.string().optional().nullable(),
    status: z.enum(accountStatusEnum.enumValues).default('active')
}).omit({
    id: true,
    public_id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true
})

export const getMidwifesQuerySchema = z.object({
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

    posyandu_id: z
        .string()
        .optional()
        .transform(val => (val ? Number.parseInt(val, 10) : undefined)),

    str_number: z.string().optional(),
    status: z.enum(accountStatusEnum.enumValues).optional(),
    search: z.string().optional(),
    includeDeleted: z
        .string()
        .optional()
        .transform(val => val === 'true')
})

export const midwifeParamsSchema = z.object({
    public_id: z.string().min(1, 'Public ID is required')
})

export const deleteMidwifeQuerySchema = z.object({
    permanent: z
        .string()
        .optional()
        .transform(val => val === 'true')
})

export const updateMidwifeSchema = createMidwifeSchema.partial()

export type CreateMidwifeInput = z.infer<typeof createMidwifeSchema>
export type UpdateMidwifeInput = z.infer<typeof updateMidwifeSchema>
export type GetMidwifesQueryInput = z.infer<typeof getMidwifesQuerySchema>
export type MidwifeParamInput = z.infer<typeof midwifeParamsSchema>
export type DeleteMidwifeQueryInput = z.infer<typeof deleteMidwifeQuerySchema>
