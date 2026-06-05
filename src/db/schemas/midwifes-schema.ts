import { statusEnum } from '@/constants/enum'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'
import { posyandus } from '@/db/schemas/posyandus-schema'
import { users } from '@/db/schemas/users-schema'
import {
    boolean,
    integer,
    pgTable,
    text,
    uniqueIndex,
    varchar
} from 'drizzle-orm/pg-core'

export const midwifes = pgTable(
    'midwifes',
    {
        ...createBaseColumns('midwifes'),

        user_id: integer('user_id')
            .notNull()
            .references(() => users.id),
        posyandu_id: integer('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        /** NIK tenaga kesehatan — identitas profesional (Satu Sehat / ASIK) */
        identity_number: varchar('identity_number', { length: 16 }).notNull(),
        /** NIP pegawai (opsional) */
        employee_number: varchar('employee_number', { length: 32 }),
        /** Surat Izin Praktik Bidan */
        license_number: varchar('license_number', { length: 50 }),

        is_mtbs_trained: boolean('is_mtbs_trained').notNull().default(false),
        is_kelas_ibu_balita_facilitator: boolean(
            'is_kelas_ibu_balita_facilitator'
        )
            .notNull()
            .default(false),
        is_pkat_member: boolean('is_pkat_member').notNull().default(false),
        is_poned_provider: boolean('is_poned_provider')
            .notNull()
            .default(false),

        /** Penugasan utama di antara beberapa posyandu */
        is_primary_assignment: boolean('is_primary_assignment')
            .notNull()
            .default(true),
        /** Catatan wilayah tugas (desa/dusun) jika berbeda dari alamat posyandu */
        duty_area_notes: text('duty_area_notes'),
        assignment_status: statusEnum('assignment_status')
            .notNull()
            .default('active'),

        ...timestamps
    },
    table => [
        uniqueIndex('midwifes_user_id_posyandu_id_unique').on(
            table.user_id,
            table.posyandu_id
        ),
        uniqueIndex('midwifes_license_number_unique').on(table.license_number)
    ]
)

export type Midwife = typeof midwifes.$inferSelect
export type NewMidwife = typeof midwifes.$inferInsert
