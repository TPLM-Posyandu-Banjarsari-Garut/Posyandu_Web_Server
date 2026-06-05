import { inventoryConditionEnum, inventoryUnitEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { date, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const inventories = pgTable('inventories', {
    ...createBaseColumns('inventories'),

    posyandu_id: integer('posyandu_id')
        .notNull()
        .references(() => posyandus.id),

    item_name: varchar('item_name', { length: 100 }).notNull(),
    description: text('description'),
    quantity: integer('quantity').notNull().default(0),
    unit: inventoryUnitEnum('unit').notNull().default('pcs'),
    condition: inventoryConditionEnum('condition').notNull().default('good'),
    last_checked_date: date('last_checked_date', { mode: 'date' }),
    notes: text('notes'),

    ...timestamps
})

export type Inventory = typeof inventories.$inferSelect
export type NewInventory = typeof inventories.$inferInsert
