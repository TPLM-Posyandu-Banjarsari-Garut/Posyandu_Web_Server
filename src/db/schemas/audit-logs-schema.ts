import {
    pgTable,
    text,
    varchar,
    jsonb,
    integer,
    index
} from 'drizzle-orm/pg-core'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'

export const auditLogs = pgTable(
    'audit_logs',
    {
        ...createBaseColumns('audit_logs'),

        userId: text('user_id'),
        action: varchar('action', { length: 100 }),

        entityType: varchar('entity_type', { length: 50 }),
        entityId: text('entity_id'),

        oldValue: jsonb('old_value'),
        newValue: jsonb('new_value'),

        ipAddress: varchar('ip_address', { length: 45 }),
        userAgent: text('user_agent'),
        payload: jsonb('payload'),
        statusCode: integer('status_code'),

        ...timestamps
    },
    table => [
        index('audit_logs_user_id_idx').on(table.userId),
        index('audit_logs_entity_idx').on(table.entityType, table.entityId),
        index('audit_logs_created_at_idx').on(table.created_at),
        index('audit_logs_is_deleted_idx').on(table.is_deleted)
    ]
)

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
