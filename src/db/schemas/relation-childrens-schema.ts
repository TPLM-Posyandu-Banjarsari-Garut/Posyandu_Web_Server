import { familyRelationEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { childrens } from '@/db/schemas/childrens-schema'
import { parents } from '@/db/schemas/parents-schema'
import { integer, pgTable } from 'drizzle-orm/pg-core'

export const relationChildrens = pgTable('relation_childrens', {
    ...createBaseColumns('relation_childrens'),

    parent_id: integer('parent_id')
        .notNull()
        .references(() => parents.id),
    children_id: integer('children_id')
        .notNull()
        .references(() => childrens.id),

    relation: familyRelationEnum('relation').notNull(),

    ...timestamps
})

export type RelationChildren = typeof relationChildrens.$inferSelect
export type NewRelationChildren = typeof relationChildrens.$inferInsert
