import { statusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const educationCategories = pgTable('education_categories', {
    ...createBaseColumns('education_categories'),

    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    description: text('description'),
    status: statusEnum('status').notNull().default('active'),

    ...timestamps
})

export type EducationCategory = typeof educationCategories.$inferSelect
export type NewEducationCategory = typeof educationCategories.$inferInsert
