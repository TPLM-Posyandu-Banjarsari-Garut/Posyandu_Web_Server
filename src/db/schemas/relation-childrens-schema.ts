import { familyRelationEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { childrens } from '@/db/schemas/childrens-schema'
import { parents } from '@/db/schemas/parents-schema'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const relationChildrens = pgTable('relation_childrens', {
    ...createBaseColumns('relation_childrens'),

    parent_id: text('parent_id')
        .notNull()
        .references(() => parents.id, { onDelete: 'cascade' }),
    children_id: text('children_id')
        .notNull()
        .references(() => childrens.id, { onDelete: 'cascade' }),

    relation: familyRelationEnum('relation').notNull(),

    ...timestamps
})

export type RelationChildren = typeof relationChildrens.$inferSelect
export type NewRelationChildren = typeof relationChildrens.$inferInsert
