import { statusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const posyandus = pgTable('posyandus', {
    ...createBaseColumns('posyandus'),

    name: varchar('name', { length: 100 }).notNull().unique(),

    address_line: text('address_line'),
    rt: varchar('rt', { length: 5 }),
    rw: varchar('rw', { length: 5 }),
    village_name: varchar('village_name', { length: 100 }).default(
        'Banjarsari'
    ),

    contact_number: varchar('contact_number', { length: 20 }),
    status: statusEnum('status').notNull().default('active'),

    ...timestamps
})

export type Posyandu = typeof posyandus.$inferSelect
export type NewPosyandu = typeof posyandus.$inferInsert
