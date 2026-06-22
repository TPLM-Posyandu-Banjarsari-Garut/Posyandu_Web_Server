import { examinationStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { examinationSchedules } from '@/db/schemas/examination-schedules-schema'
import { examinations } from '@/db/schemas/examinations-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { parents } from '@/db/schemas/parents-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { sql } from 'drizzle-orm'
import {
    check,
    date,
    pgTable,
    text,
    timestamp,
    index
} from 'drizzle-orm/pg-core'

export const examinationRecords = pgTable(
    'examination_records',
    {
        ...createBaseColumns('examination_records'),

        examination_id: text('examination_id')
            .notNull()
            .references(() => examinations.id),
        schedule_id: text('schedule_id').references(
            () => examinationSchedules.id
        ),
        posyandu_id: text('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        children_id: text('children_id').references(() => childrens.id),
        parent_id: text('parent_id').references(() => parents.id),

        cadre_id: text('cadre_id')
            .notNull()
            .references(() => cadres.id),
        midwife_id: text('midwife_id')
            .notNull()
            .references(() => midwifes.id),

        examination_date: date('examination_date', { mode: 'date' }).notNull(),
        status: examinationStatusEnum('status').notNull().default('pending'),
        result_summary: text('result_summary'),
        notes: text('notes'),

        medically_validated_at: timestamp('medically_validated_at', {
            withTimezone: true,
            mode: 'date'
        }),
        medically_validated_by_midwife_id: text(
            'medically_validated_by_midwife_id'
        ).references(() => midwifes.id),

        ...timestamps
    },
    table => [
        check(
            'examination_records_subject_check',
            sql`${table.children_id} IS NOT NULL OR ${table.parent_id} IS NOT NULL`
        ),
        index('examination_records_examination_id_idx').on(
            table.examination_id
        ),
        index('examination_records_schedule_id_idx').on(table.schedule_id),
        index('examination_records_posyandu_id_idx').on(table.posyandu_id),
        index('examination_records_children_id_idx').on(table.children_id),
        index('examination_records_parent_id_idx').on(table.parent_id),
        index('examination_records_cadre_id_idx').on(table.cadre_id),
        index('examination_records_midwife_id_idx').on(table.midwife_id),
        index('examination_records_medically_validated_by_midwife_id_idx').on(
            table.medically_validated_by_midwife_id
        ),
        index('examination_records_is_deleted_idx').on(table.is_deleted)
    ]
)

export type ExaminationRecord = typeof examinationRecords.$inferSelect
export type NewExaminationRecord = typeof examinationRecords.$inferInsert
