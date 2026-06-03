import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { pgTable, text, varchar } from 'drizzle-orm/pg-core'

export const healthCenters = pgTable('health_centers', {
    ...createBaseColumns('health_centers'),

    name: varchar('name', { length: 100 }).notNull().unique(),

    address_line: text('address_line'),
    village_name: varchar('village_name', { length: 100 }),

    contact_number: varchar('contact_number', { length: 20 }),
    head_name: varchar('head_name', { length: 100 }), // Nama Kepala Puskesmas

    ...timestamps
})

export type HealthCenter = typeof healthCenters.$inferSelect
export type NewHealthCenter = typeof healthCenters.$inferInsert
