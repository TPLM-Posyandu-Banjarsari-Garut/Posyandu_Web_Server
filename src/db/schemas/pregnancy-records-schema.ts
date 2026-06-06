import { pregnancyStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { parents } from '@/db/schemas/parents-schema'
import { date, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const pregnancyRecords = pgTable('pregnancy_records', {
    ...createBaseColumns('pregnancy_records'),

    parent_id: integer('parent_id')
        .notNull()
        .references(() => parents.id),

    pregnancy_status: pregnancyStatusEnum('pregnancy_status')
        .notNull()
        .default('first_trimester'),
    last_menstrual_period: date('last_menstrual_period', { mode: 'date' }),
    estimated_due_date: date('estimated_due_date', { mode: 'date' }),
    gravida: integer('gravida'),
    parity: integer('parity'),
    notes: text('notes'),

    ...timestamps
})

export type PregnancyRecord = typeof pregnancyRecords.$inferSelect
export type NewPregnancyRecord = typeof pregnancyRecords.$inferInsert
