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
import { check, date, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const examinationRecords = pgTable(
    'examination_records',
    {
        ...createBaseColumns('examination_records'),

        examination_id: integer('examination_id')
            .notNull()
            .references(() => examinations.id),
        schedule_id: integer('schedule_id').references(
            () => examinationSchedules.id
        ),
        posyandu_id: integer('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        children_id: integer('children_id').references(() => childrens.id),
        parent_id: integer('parent_id').references(() => parents.id),

        cadre_id: integer('cadre_id').references(() => cadres.id),
        midwife_id: integer('midwife_id').references(() => midwifes.id),

        examination_date: date('examination_date', { mode: 'date' }).notNull(),
        status: examinationStatusEnum('status').notNull().default('pending'),
        result_summary: text('result_summary'),
        notes: text('notes'),

        ...timestamps
    },
    table => [
        check(
            'examination_records_subject_check',
            sql`${table.children_id} IS NOT NULL OR ${table.parent_id} IS NOT NULL`
        )
    ]
)

export type ExaminationRecord = typeof examinationRecords.$inferSelect
export type NewExaminationRecord = typeof examinationRecords.$inferInsert
