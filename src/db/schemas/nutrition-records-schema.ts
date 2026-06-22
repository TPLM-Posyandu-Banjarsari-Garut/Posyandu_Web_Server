import { nutritionStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import {
    date,
    decimal,
    integer,
    pgTable,
    text,
    index
} from 'drizzle-orm/pg-core'

export const nutritionRecords = pgTable(
    'nutrition_records',
    {
        ...createBaseColumns('nutrition_records'),

        children_id: text('children_id')
            .notNull()
            .references(() => childrens.id),

        measurement_date: date('measurement_date', { mode: 'date' }).notNull(),
        weight_kg: decimal('weight_kg', { precision: 5, scale: 2 }),
        height_cm: decimal('height_cm', { precision: 5, scale: 2 }),
        head_circumference_cm: decimal('head_circumference_cm', {
            precision: 5,
            scale: 2
        }),
        age_months: integer('age_months'),
        nutrition_status: nutritionStatusEnum('nutrition_status').notNull(),

        cadre_id: text('cadre_id').references(() => cadres.id),
        midwife_id: text('midwife_id').references(() => midwifes.id),
        notes: text('notes'),

        ...timestamps
    },
    table => [
        index('nutrition_records_children_id_idx').on(table.children_id),
        index('nutrition_records_cadre_id_idx').on(table.cadre_id),
        index('nutrition_records_midwife_id_idx').on(table.midwife_id),
        index('nutrition_records_is_deleted_idx').on(table.is_deleted)
    ]
)

export type NutritionRecord = typeof nutritionRecords.$inferSelect
export type NewNutritionRecord = typeof nutritionRecords.$inferInsert
