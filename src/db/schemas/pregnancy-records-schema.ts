import { pregnancyStatusEnum, pregnancyRiskEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { parents } from '@/db/schemas/parents-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { date, integer, pgTable, text, boolean } from 'drizzle-orm/pg-core'

export const pregnancyRecords = pgTable('pregnancy_records', {
    ...createBaseColumns('pregnancy_records'),

    parent_id: text('parent_id')
        .notNull()
        .references(() => parents.id),

    posyandu_id: text('posyandu_id')
        .notNull()
        .references(() => posyandus.id),

    midwife_id: text('midwife_id').references(() => midwifes.id),

    pregnancy_status: pregnancyStatusEnum('pregnancy_status')
        .notNull()
        .default('first_trimester'),

    risk_level: pregnancyRiskEnum('risk_level').default('low'),

    last_menstrual_period: date('last_menstrual_period', { mode: 'date' }),
    estimated_due_date: date('estimated_due_date', { mode: 'date' }),
    gravida: integer('gravida'),
    parity: integer('parity'),
    abortus: integer('abortus'),
    is_active: boolean('is_active').notNull().default(true),
    notes: text('notes'),

    ...timestamps
})

export type PregnancyRecord = typeof pregnancyRecords.$inferSelect
export type NewPregnancyRecord = typeof pregnancyRecords.$inferInsert
