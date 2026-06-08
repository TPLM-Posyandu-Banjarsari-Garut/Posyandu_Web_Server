import {
    inventories,
    inventoryConditionEnum,
    inventoryItemTypeEnum,
    inventoryUnitEnum
} from '@/db'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const createInventorySchema = createInsertSchema(inventories, {
    posyandu_id: z
        .string()
        .min(1, 'Posyandu ID is required')
        .openapi({ example: 'pos-123' }),

    item_name: z
        .string()
        .min(3, 'Item name must be at least 3 characters')
        .max(100, 'Item name cannot exceed 100 characters')
        .openapi({ example: 'Timbangan Digital' }),

    item_type: z.enum(inventoryItemTypeEnum.enumValues).default('general'),

    description: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Timbangan digital untuk bayi' }),

    quantity: z
        .number()
        .int()
        .min(0, 'Quantity cannot be negative')
        .default(0)
        .openapi({ example: 1 }),

    unit: z.enum(inventoryUnitEnum.enumValues).default('pcs'),

    condition: z.enum(inventoryConditionEnum.enumValues).default('good'),

    batch_number: z
        .string()
        .max(50, 'Batch number cannot exceed 50 characters')
        .optional()
        .nullable()
        .openapi({ example: 'BATCH-2023-01' }),

    expiry_date: z
        .string()
        .transform(val => new Date(val))
        .optional()
        .nullable()
        .openapi({ type: 'string', format: 'date', example: '2026-12-31' }),

    last_checked_date: z
        .string()
        .transform(val => new Date(val))
        .optional()
        .nullable()
        .openapi({ type: 'string', format: 'date', example: '2026-06-08' }),

    managed_by_midwife_id: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'midwife-123' }),

    notes: z
        .string()
        .optional()
        .nullable()
        .openapi({ example: 'Baterai perlu diganti bulan depan' })
})
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true
    })
    .openapi('CreateInventoryInput')

export const getInventoriesQuerySchema = z
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

        posyandu_id: z.string().optional(),
        search: z.string().optional(),
        item_type: z.enum(inventoryItemTypeEnum.enumValues).optional(),
        condition: z.enum(inventoryConditionEnum.enumValues).optional(),
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
    .openapi('GetInventoriesQuery')

export const inventoryParamsSchema = z
    .object({
        public_id: z
            .string()
            .min(1, 'Public ID is required')
            .openapi({ example: 'inv-xyz-123' })
    })
    .openapi('InventoryParams')

export const deleteInventoryQuerySchema = z
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
    .openapi('DeleteInventoryQuery')

export const updateInventorySchema = createInventorySchema
    .partial()
    .openapi('UpdateInventoryInput')

export type CreateInventoryInput = z.infer<typeof createInventorySchema>
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>
export type GetInventoriesQueryInput = z.infer<typeof getInventoriesQuerySchema>
export type InventoryParamInput = z.infer<typeof inventoryParamsSchema>
export type DeleteInventoryQueryInput = z.infer<
    typeof deleteInventoryQuerySchema
>
