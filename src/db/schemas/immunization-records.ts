import {
    immunizationStatusEnum,
    scheduleComplianceEnum,
    serviceLocationTypeEnum,
    syncStatusEnum
} from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { inventories } from '@/db/schemas/inventories-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { vaccines } from '@/db/schemas/vaccines-schema'
import {
    boolean,
    date,
    integer,
    pgTable,
    text,
    unique,
    varchar,
    index
} from 'drizzle-orm/pg-core'

export const immunizationRecords = pgTable(
    'immunization_records',
    {
        ...createBaseColumns('immunization_records'),

        children_id: text('children_id')
            .notNull()
            .references(() => childrens.id),
        vaccine_id: text('vaccine_id')
            .notNull()
            .references(() => vaccines.id),
        cadre_id: text('cadre_id').references(() => cadres.id),
        midwife_id: text('midwife_id').references(() => midwifes.id),
        posyandu_id: text('posyandu_id').references(() => posyandus.id),
        inventory_id: text('inventory_id').references(() => inventories.id),

        dose_number: integer('dose_number').notNull(),
        date_given: date('date_given', { mode: 'date' }),
        batch_number: varchar('batch_number', { length: 50 }),
        status: immunizationStatusEnum('status').notNull().default('scheduled'),
        kipi_status: boolean('kipi_status').notNull().default(false),
        schedule_compliance: scheduleComplianceEnum('schedule_compliance'),
        status_dofu: boolean('status_dofu').notNull().default(false),
        sync_status: syncStatusEnum('sync_status').notNull().default('pending'),
        external_ref_id: varchar('external_ref_id', { length: 100 }),
        location_type: serviceLocationTypeEnum('location_type'),
        notes: text('notes'),

        ...timestamps
    },
    table => [
        unique('immunization_records_child_vaccine_dose_unique').on(
            table.children_id,
            table.vaccine_id,
            table.dose_number
        ),
        index('immunization_records_children_id_idx').on(table.children_id),
        index('immunization_records_vaccine_id_idx').on(table.vaccine_id),
        index('immunization_records_cadre_id_idx').on(table.cadre_id),
        index('immunization_records_midwife_id_idx').on(table.midwife_id),
        index('immunization_records_posyandu_id_idx').on(table.posyandu_id),
        index('immunization_records_inventory_id_idx').on(table.inventory_id),
        index('immunization_records_is_deleted_idx').on(table.is_deleted)
    ]
)

export type ImmunizationRecord = typeof immunizationRecords.$inferSelect
export type NewImmunizationRecord = typeof immunizationRecords.$inferInsert
