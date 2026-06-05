import { cadrePositionEnum, statusEnum } from '@/constants/enum'
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

export const cadres = pgTable(
    'cadres',
    {
        ...createBaseColumns('cadres'),

        user_id: integer('user_id')
            .notNull()
            .references(() => users.id),
        posyandu_id: integer('posyandu_id')
            .notNull()
            .references(() => posyandus.id),

        /** NIK kader — identitas administratif (FR-A-01: akun dibuat admin) */
        identity_number: varchar('identity_number', { length: 16 }),

        /** Jabatan struktural Posyandu: ketua, sekretaris, bendahara, anggota */
        position: cadrePositionEnum('position').notNull().default('member'),

        /** Penugasan utama jika kader ditugaskan di lebih dari satu posyandu */
        is_primary_assignment: boolean('is_primary_assignment')
            .notNull()
            .default(true),
        /** Catatan wilayah tugas (desa/dusun) — FR-K: pengelolaan berdasarkan wilayah */
        duty_area_notes: text('duty_area_notes'),
        assignment_status: statusEnum('assignment_status')
            .notNull()
            .default('active'),

        ...timestamps
    },
    table => [
        uniqueIndex('cadres_user_id_posyandu_id_unique').on(
            table.user_id,
            table.posyandu_id
        )
    ]
)

export type Cadre = typeof cadres.$inferSelect
export type NewCadre = typeof cadres.$inferInsert
