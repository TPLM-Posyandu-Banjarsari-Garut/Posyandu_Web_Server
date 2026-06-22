import { examinationStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { examinations } from '@/db/schemas/examinations-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { cadres } from '@/db/schemas/cadres-schema'
import {
    date,
    integer,
    pgTable,
    text,
    time,
    varchar,
    index
} from 'drizzle-orm/pg-core'

export const examinationSchedules = pgTable(
    'examination_schedules',
    {
        ...createBaseColumns('examination_schedules'),

        examination_id: text('examination_id')
            .notNull()
            .references(() => examinations.id),
        posyandu_id: text('posyandu_id')
            .notNull()
            .references(() => posyandus.id),
        midwife_id: text('midwife_id').references(() => midwifes.id),
        cadre_id: text('cadre_id').references(() => cadres.id),

        scheduled_date: date('scheduled_date', { mode: 'date' }).notNull(),
        start_time: time('start_time'),
        end_time: time('end_time'),
        max_participants: integer('max_participants').default(20),
        current_participants: integer('current_participants')
            .notNull()
            .default(0),
        location_notes: varchar('location_notes', { length: 200 }),
        status: examinationStatusEnum('status').notNull().default('pending'),
        notes: text('notes'),

        ...timestamps
    },
    table => [
        index('examination_schedules_examination_id_idx').on(
            table.examination_id
        ),
        index('examination_schedules_posyandu_id_idx').on(table.posyandu_id),
        index('examination_schedules_midwife_id_idx').on(table.midwife_id),
        index('examination_schedules_cadre_id_idx').on(table.cadre_id),
        index('examination_schedules_is_deleted_idx').on(table.is_deleted)
    ]
)

export type ExaminationSchedule = typeof examinationSchedules.$inferSelect
export type NewExaminationSchedule = typeof examinationSchedules.$inferInsert
