import { kipiSeverityEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { encryptedText } from '@/db/helpers/encrypted-field'
import { timestamps } from '@/db/helpers/timestamps'
import { immunizationRecords } from '@/db/schemas/immunization-records'
import { boolean, integer, pgTable, text, index } from 'drizzle-orm/pg-core'

export const kipiDetails = pgTable(
    'kipi_details',
    {
        ...createBaseColumns('kipi_details'),

        immunization_record_id: text('immunization_record_id')
            .notNull()
            .unique()
            .references(() => immunizationRecords.id),

        symptoms: encryptedText('symptoms', 'kipi_details.symptoms').notNull(),
        severity: kipiSeverityEnum('severity').notNull(),
        action_taken: encryptedText(
            'action_taken',
            'kipi_details.action_taken'
        ),
        referred: boolean('referred').notNull().default(false),

        ...timestamps
    },
    table => [
        index('kipi_details_immunization_record_id_idx').on(
            table.immunization_record_id
        ),
        index('kipi_details_is_deleted_idx').on(table.is_deleted)
    ]
)

export type KipiDetail = typeof kipiDetails.$inferSelect
export type NewKipiDetail = typeof kipiDetails.$inferInsert
