import {
    inventoryConditionEnum,
    inventoryItemTypeEnum,
    inventoryUnitEnum
} from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { date, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const inventories = pgTable('inventories', {
    ...createBaseColumns('inventories'),

    posyandu_id: text('posyandu_id')
        .notNull()
        .references(() => posyandus.id),

    item_name: varchar('item_name', { length: 100 }).notNull(),
    item_type: inventoryItemTypeEnum('item_type').notNull().default('general'),
    description: text('description'),
    quantity: integer('quantity').notNull().default(0),
    unit: inventoryUnitEnum('unit').notNull().default('pcs'),
    condition: inventoryConditionEnum('condition').notNull().default('good'),
    batch_number: varchar('batch_number', { length: 50 }),
    expiry_date: date('expiry_date', { mode: 'date' }),
    last_checked_date: date('last_checked_date', { mode: 'date' }),
    managed_by_midwife_id: text('managed_by_midwife_id').references(
        () => midwifes.id
    ),
    notes: text('notes'),

    ...timestamps
})

export type Inventory = typeof inventories.$inferSelect
export type NewInventory = typeof inventories.$inferInsert
