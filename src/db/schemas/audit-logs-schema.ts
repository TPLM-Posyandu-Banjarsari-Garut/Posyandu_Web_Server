import { pgTable, text, varchar, jsonb, integer } from 'drizzle-orm/pg-core'
import { createBaseColumns } from '@/db/helpers/base-columns'
import { timestamps } from '@/db/helpers/timestamps'

export const auditLogs = pgTable('audit_logs', {
    ...createBaseColumns('audit_logs'),
    userId: text('user_id'),
    action: varchar('action', { length: 100 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    payload: jsonb('payload'),
    statusCode: integer('status_code'),
    ...timestamps
})

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
