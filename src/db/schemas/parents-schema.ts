import { bloodTypeEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { users } from '@/db/schemas/users-schema'
import { date, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const parents = pgTable('parents', {
    ...createBaseColumns('parents'),

    user_id: integer('user_id')
        .notNull()
        .unique()
        .references(() => users.id),

    identity_number: varchar('identity_number', { length: 16 }).unique(), // NIK
    place_of_birth: varchar('place_of_birth', { length: 50 }),
    date_of_birth: date('date_of_birth', { mode: 'date' }),

    blood_type: bloodTypeEnum('blood_type'),
    education: varchar('education', { length: 50 }),
    occupation: varchar('occupation', { length: 50 }),

    address_line: text('address_line'),
    rt: varchar('rt', { length: 5 }),
    rw: varchar('rw', { length: 5 }),
    village_name: varchar('village_name', { length: 100 }).default(
        'Banjarsari'
    ),

    ...timestamps
})

export type Parent = typeof parents.$inferSelect
export type NewParent = typeof parents.$inferInsert
