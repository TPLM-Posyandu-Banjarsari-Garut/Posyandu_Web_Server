import { consultationStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { parents } from '@/db/schemas/parents-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { pregnancyRecords } from '@/db/schemas/pregnancy-records-schema'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const consultations = pgTable('consultations', {
    ...createBaseColumns('consultations'),

    parent_id: integer('parent_id')
        .notNull()
        .references(() => parents.id),
    pregnancy_record_id: integer('pregnancy_record_id').references(
        () => pregnancyRecords.id
    ),
    midwife_id: integer('midwife_id').references(() => midwifes.id),
    cadre_id: integer('cadre_id').references(() => cadres.id),
    posyandu_id: integer('posyandu_id')
        .notNull()
        .references(() => posyandus.id),

    scheduled_at: timestamp('scheduled_at', {
        withTimezone: true,
        mode: 'date'
    }).notNull(),
    status: consultationStatusEnum('status').notNull().default('pending'),
    notes: text('notes'),
    cancellation_reason: text('cancellation_reason'),

    ...timestamps
})

export type Consultation = typeof consultations.$inferSelect
export type NewConsultation = typeof consultations.$inferInsert
