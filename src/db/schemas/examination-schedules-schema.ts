import { examinationStatusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { examinations } from '@/db/schemas/examinations-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { date, integer, pgTable, text, time } from 'drizzle-orm/pg-core'

export const examinationSchedules = pgTable('examination_schedules', {
    ...createBaseColumns('examination_schedules'),

    examination_id: text('examination_id')
        .notNull()
        .references(() => examinations.id),
    posyandu_id: text('posyandu_id')
        .notNull()
        .references(() => posyandus.id),

    scheduled_date: date('scheduled_date', { mode: 'date' }).notNull(),
    start_time: time('start_time'),
    end_time: time('end_time'),
    max_participants: integer('max_participants').default(20),
    status: examinationStatusEnum('status').notNull().default('pending'),

    ...timestamps
})

export type ExaminationSchedule = typeof examinationSchedules.$inferSelect
export type NewExaminationSchedule = typeof examinationSchedules.$inferInsert
