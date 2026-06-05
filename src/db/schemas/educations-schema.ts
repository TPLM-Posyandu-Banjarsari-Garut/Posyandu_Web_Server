import { educationCategoryEnum, statusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { users } from '@/db/schemas/users-schema'
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const educations = pgTable('educations', {
    ...createBaseColumns('educations'),

    title: varchar('title', { length: 200 }).notNull(),
    content: text('content').notNull(),
    category: educationCategoryEnum('category').notNull().default('general'),

    posyandu_id: integer('posyandu_id').references(() => posyandus.id),
    created_by_user_id: integer('created_by_user_id')
        .notNull()
        .references(() => users.id),

    status: statusEnum('status').notNull().default('active'),

    ...timestamps
})

export type Education = typeof educations.$inferSelect
export type NewEducation = typeof educations.$inferInsert
