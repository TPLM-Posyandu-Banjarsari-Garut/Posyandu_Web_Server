import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
    created_at: timestamp('created_at', {
        withTimezone: true,
        mode: 'date'
    })
        .defaultNow()
        .notNull(),

    updated_at: timestamp('updated_at', {
        withTimezone: true,
        mode: 'date'
    })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),

    deleted_at: timestamp('deleted_at', {
        withTimezone: true,
        mode: 'date'
    })
}
