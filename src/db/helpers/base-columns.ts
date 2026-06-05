import { serial, uuid } from 'drizzle-orm/pg-core'

export const createBaseColumns = (table: string) => ({
    id: serial('id').primaryKey(),

    public_id: uuid('public_id')
        .defaultRandom()
        .notNull()
        .unique(`${table}_public_id_unique`)
})
