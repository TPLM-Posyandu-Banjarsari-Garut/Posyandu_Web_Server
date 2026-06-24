import { familyRelationEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { childrens } from '@/db/schemas/childrens-schema'
import { parents } from '@/db/schemas/parents-schema'
import { integer, pgTable, text, index } from 'drizzle-orm/pg-core'

export const relationChildrens = pgTable(
    'relation_childrens',
    {
        ...createBaseColumns('relation_childrens'),

        parent_id: text('parent_id')
            .notNull()
            .references(() => parents.id, { onDelete: 'cascade' }),
        children_id: text('children_id')
            .notNull()
            .references(() => childrens.id, { onDelete: 'cascade' }),

        relation: familyRelationEnum('relation').notNull(),

        ...timestamps
    },
    table => [
        index('relation_childrens_parent_id_idx').on(table.parent_id),
        index('relation_childrens_children_id_idx').on(table.children_id),
        index('relation_childrens_is_deleted_idx').on(table.is_deleted),
        index('relation_childrens_parent_idx').on(
            table.parent_id,
            table.children_id
        )
    ]
)

export type RelationChildren = typeof relationChildrens.$inferSelect
export type NewRelationChildren = typeof relationChildrens.$inferInsert
