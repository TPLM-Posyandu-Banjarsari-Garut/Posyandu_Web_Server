import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

const baseUserSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .max(255, 'Email cannot exceed 255 characters'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password cannot exceed 100 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    phone_number: z
        .string()
        .max(20, 'Phone number cannot exceed 20 characters')
        .optional()
        .nullable(),
    avatar_url: z.string().url('Must be a valid URL').optional().nullable()
})

export const registerParentSchema = baseUserSchema
    .extend({
        role: z.literal('parent'),
        parent_data: z
            .object({
                identity_number: z
                    .string()
                    .length(
                        16,
                        'Identity number (NIK) must be exactly 16 characters'
                    )
                    .optional(),
                place_of_birth: z
                    .string()
                    .max(50, 'Place of birth cannot exceed 50 characters')
                    .optional(),
                date_of_birth: z.coerce.date().optional(),
                blood_type: z.enum(['A', 'B', 'AB', 'O', 'UNKNOWN']).optional(),
                education: z
                    .string()
                    .max(50, 'Education cannot exceed 50 characters')
                    .optional(),
                occupation: z
                    .string()
                    .max(50, 'Occupation cannot exceed 50 characters')
                    .optional(),
                address_line: z.string().optional(),
                rt: z
                    .string()
                    .max(5, 'RT cannot exceed 5 characters')
                    .optional(),
                rw: z
                    .string()
                    .max(5, 'RW cannot exceed 5 characters')
                    .optional()
            })
            .optional()
    })
    .openapi('RegisterParentInput')

export const registerCadreSchema = baseUserSchema
    .extend({
        role: z.literal('cadre'),
        cadre_data: z.object({
            posyandu_id: z.string().min(1, 'posyandu_id is required'),
            identity_number: z
                .string()
                .length(
                    16,
                    'Identity number (NIK) must be exactly 16 characters'
                )
                .optional(),
            position: z
                .enum(['leader', 'secretary', 'treasurer', 'member'])
                .default('member'),
            is_primary_assignment: z.boolean().default(true),
            duty_area_notes: z.string().optional()
        })
    })
    .openapi('RegisterCadreInput')

export const registerMidwifeSchema = baseUserSchema
    .extend({
        role: z.literal('midwife'),
        midwife_data: z.object({
            posyandu_id: z.string().min(1, 'posyandu_id is required'),
            identity_number: z
                .string()
                .length(
                    16,
                    'Identity number (NIK) must be exactly 16 characters'
                ),
            employee_number: z
                .string()
                .max(32, 'Employee number cannot exceed 32 characters')
                .optional(),
            license_number: z
                .string()
                .max(50, 'License number cannot exceed 50 characters')
                .optional(),
            is_mtbs_trained: z.boolean().default(false),
            is_kelas_ibu_balita_facilitator: z.boolean().default(false),
            is_pkat_member: z.boolean().default(false),
            is_poned_provider: z.boolean().default(false),
            is_primary_assignment: z.boolean().default(true),
            duty_area_notes: z.string().optional()
        })
    })
    .openapi('RegisterMidwifeInput')

export type RegisterParentInput = z.infer<typeof registerParentSchema>
export type RegisterCadreInput = z.infer<typeof registerCadreSchema>
export type RegisterMidwifeInput = z.infer<typeof registerMidwifeSchema>
