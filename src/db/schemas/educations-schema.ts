import { statusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { educationCategories } from '@/db/schemas/education-categories-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { users } from '@/db/schemas/users-schema'
import { integer, pgTable, text, varchar, index } from 'drizzle-orm/pg-core'

export const educations = pgTable(
    'educations',
    {
        ...createBaseColumns('educations'),

        title: varchar('title', { length: 200 }).notNull(),
        content: text('content').notNull(),
        summary: text('summary'),
        image_url: text('image_url'),
        category_id: text('category_id')
            .notNull()
            .references(() => educationCategories.id),
        views_count: integer('views_count').notNull().default(0),
        read_time: integer('read_time').default(1),

        posyandu_id: text('posyandu_id').references(() => posyandus.id),
        created_by_user_id: text('created_by_user_id')
            .notNull()
            .references(() => users.id),

        status: statusEnum('status').notNull().default('active'),

        ...timestamps
    },
    table => [
        index('educations_category_id_idx').on(table.category_id),
        index('educations_posyandu_id_idx').on(table.posyandu_id),
        index('educations_created_by_user_id_idx').on(table.created_by_user_id),
        index('educations_is_deleted_idx').on(table.is_deleted)
    ]
)

export type Education = typeof educations.$inferSelect
export type NewEducation = typeof educations.$inferInsert
