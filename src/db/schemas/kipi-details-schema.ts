import { kipiSeverityEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { immunizationRecords } from '@/db/schemas/immunization-records'
import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core'

export const kipiDetails = pgTable('kipi_details', {
    ...createBaseColumns('kipi_details'),

    immunization_record_id: text('immunization_record_id')
        .notNull()
        .unique()
        .references(() => immunizationRecords.id),

    symptoms: text('symptoms').notNull(),
    severity: kipiSeverityEnum('severity').notNull(),
    action_taken: text('action_taken'),
    referred: boolean('referred').notNull().default(false),

    ...timestamps
})

export type KipiDetail = typeof kipiDetails.$inferSelect
export type NewKipiDetail = typeof kipiDetails.$inferInsert
