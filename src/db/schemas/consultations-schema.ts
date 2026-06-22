import { consultationStatusEnum, consultationTypeEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { parents } from '@/db/schemas/parents-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { pregnancyRecords } from '@/db/schemas/pregnancy-records-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { sql } from 'drizzle-orm'
import {
    integer,
    pgTable,
    text,
    timestamp,
    check,
    boolean,
    date,
    index,
    uniqueIndex
} from 'drizzle-orm/pg-core'

export const consultations = pgTable(
    'consultations',
    {
        ...createBaseColumns('consultations'),

        parent_id: text('parent_id')
            .notNull()
            .references(() => parents.id),
        pregnancy_record_id: text('pregnancy_record_id').references(
            () => pregnancyRecords.id
        ),
        children_id: text('children_id').references(() => childrens.id),
        midwife_id: text('midwife_id').references(() => midwifes.id),
        cadre_id: text('cadre_id').references(() => cadres.id),
        posyandu_id: text('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        consultation_type: consultationTypeEnum('consultation_type')
            .notNull()
            .default('pregnancy'),

        scheduled_at: timestamp('scheduled_at', {
            withTimezone: true,
            mode: 'date'
        }).notNull(),
        actual_start_at: timestamp('actual_start_at', {
            withTimezone: true,
            mode: 'date'
        }),
        duration_minutes: integer('duration_minutes'),
        follow_up_required: boolean('follow_up_required')
            .notNull()
            .default(false),
        follow_up_date: date('follow_up_date', { mode: 'date' }),

        status: consultationStatusEnum('status').notNull().default('pending'),
        notes: text('notes'),
        cancellation_reason: text('cancellation_reason'),

        ...timestamps
    },
    table => [
        check(
            'consultations_context_check',
            sql`(${table.consultation_type} = 'pregnancy' AND ${table.pregnancy_record_id} IS NOT NULL AND ${table.children_id} IS NULL) OR (${table.consultation_type} = 'child_development' AND ${table.children_id} IS NOT NULL AND ${table.pregnancy_record_id} IS NULL) OR (${table.consultation_type} = 'general' AND ${table.pregnancy_record_id} IS NULL AND ${table.children_id} IS NULL)`
        ),
        uniqueIndex('consultations_slot_unique_idx')
            .on(table.posyandu_id, table.consultation_type, table.scheduled_at)
            .where(sql`status != 'cancelled' AND deleted_at IS NULL`),
        uniqueIndex('consultations_parent_schedule_unique_idx')
            .on(table.parent_id, table.scheduled_at)
            .where(sql`status != 'cancelled' AND deleted_at IS NULL`),
        index('consultations_parent_id_idx').on(table.parent_id),
        index('consultations_pregnancy_record_id_idx').on(
            table.pregnancy_record_id
        ),
        index('consultations_children_id_idx').on(table.children_id),
        index('consultations_posyandu_id_idx').on(table.posyandu_id),
        index('consultations_midwife_id_idx').on(table.midwife_id),
        index('consultations_cadre_id_idx').on(table.cadre_id),
        index('consultations_is_deleted_idx').on(table.is_deleted)
    ]
)

export type Consultation = typeof consultations.$inferSelect
export type NewConsultation = typeof consultations.$inferInsert
