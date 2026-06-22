import {
    distributionPeriodEnum,
    serviceLocationTypeEnum,
    syncStatusEnum,
    vitaminRecordStatusEnum
} from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { cadres } from '@/db/schemas/cadres-schema'
import { childrens } from '@/db/schemas/childrens-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { vitamins } from '@/db/schemas/vitamins-schema'
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

export const vitaminRecords = pgTable(
    'vitamin_records',
    {
        ...createBaseColumns('vitamin_records'),

        children_id: text('children_id')
            .notNull()
            .references(() => childrens.id),
        vitamin_id: text('vitamin_id')
            .notNull()
            .references(() => vitamins.id),
        cadre_id: text('cadre_id').references(() => cadres.id),
        midwife_id: text('midwife_id').references(() => midwifes.id),
        posyandu_id: text('posyandu_id').references(() => posyandus.id),

        distribution_period: distributionPeriodEnum(
            'distribution_period'
        ).notNull(),
        distribution_year: integer('distribution_year').notNull(),
        date_given: date('date_given', { mode: 'date' }),
        status: vitaminRecordStatusEnum('status').notNull().default('not_yet'),
        given_deworming: boolean('given_deworming').notNull().default(false),
        is_sweeping: boolean('is_sweeping').notNull().default(false),
        is_received: boolean('is_received'),
        location_type: serviceLocationTypeEnum('location_type'),
        sync_status: syncStatusEnum('sync_status').notNull().default('pending'),
        external_ref_id: varchar('external_ref_id', { length: 100 }),
        special_condition_notes: text('special_condition_notes'),
        notes: text('notes'),

        ...timestamps
    },
    table => [
        unique('vitamin_records_child_period_year_unique').on(
            table.children_id,
            table.distribution_period,
            table.distribution_year
        ),
        index('vitamin_records_children_id_idx').on(table.children_id),
        index('vitamin_records_vitamin_id_idx').on(table.vitamin_id),
        index('vitamin_records_cadre_id_idx').on(table.cadre_id),
        index('vitamin_records_midwife_id_idx').on(table.midwife_id),
        index('vitamin_records_posyandu_id_idx').on(table.posyandu_id),
        index('vitamin_records_is_deleted_idx').on(table.is_deleted)
    ]
)

export type VitaminRecord = typeof vitaminRecords.$inferSelect
export type NewVitaminRecord = typeof vitaminRecords.$inferInsert
