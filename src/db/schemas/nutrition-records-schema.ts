import { nutritionStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { date, decimal, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const nutritionRecords = pgTable('nutrition_records', {
    ...createBaseColumns('nutrition_records'),

    children_id: integer('children_id')
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

    cadre_id: integer('cadre_id').references(() => cadres.id),
    midwife_id: integer('midwife_id').references(() => midwifes.id),
    notes: text('notes'),

    ...timestamps
})

export type NutritionRecord = typeof nutritionRecords.$inferSelect
export type NewNutritionRecord = typeof nutritionRecords.$inferInsert
