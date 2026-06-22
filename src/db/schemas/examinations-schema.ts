import { examinationTypeEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import {
    integer,
    pgTable,
    text,
    uniqueIndex,
    varchar,
    boolean,
    jsonb,
    index
} from 'drizzle-orm/pg-core'

export const examinations = pgTable(
    'examinations',
    {
        ...createBaseColumns('examinations'),

        posyandu_id: text('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        name: varchar('name', { length: 100 }).notNull(),
        description: text('description'),
        examination_type: examinationTypeEnum('examination_type').notNull(),
        target_age_months: integer('target_age_months'),
        target_trimester: varchar('target_trimester', { length: 50 }),
        checklist_items: jsonb('checklist_items'),
        is_active: boolean('is_active').notNull().default(true),

        ...timestamps
    },
    table => [
        uniqueIndex('examinations_posyandu_id_name_unique').on(
            table.posyandu_id,
            table.name
        ),
        index('examinations_is_deleted_idx').on(table.is_deleted)
    ]
)

export type Examination = typeof examinations.$inferSelect
export type NewExamination = typeof examinations.$inferInsert
