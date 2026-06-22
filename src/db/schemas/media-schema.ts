import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { pgTable, text, integer, varchar, index } from 'drizzle-orm/pg-core'
import { users } from './users-schema'

export const media = pgTable(
    'media',
    {
        ...createBaseColumns('media'),
        file_name: varchar('file_name', { length: 255 }).notNull(),
        original_name: varchar('original_name', { length: 255 }).notNull(),
        file_size: integer('file_size').notNull(),
        mime_type: varchar('mime_type', { length: 100 }).notNull(),
        file_extension: varchar('file_extension', { length: 10 }).notNull(),
        file_category: varchar('file_category', { length: 20 }).notNull(),
        url: text('url').notNull(),
        r2_key: text('r2_key').notNull(),
        uploaded_by: text('uploaded_by')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        ...timestamps
    },
    table => [
        index('media_uploaded_by_idx').on(table.uploaded_by),
        index('media_file_category_idx').on(table.file_category),
        index('media_created_at_idx').on(table.created_at),
        index('media_is_deleted_idx').on(table.is_deleted)
    ]
)

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
