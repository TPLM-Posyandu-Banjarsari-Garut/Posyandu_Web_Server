import db from '@/configs/db'
import { auditLogs } from '@/db'
import { Request } from 'express'
import crypto from 'crypto'
import { logger } from '@/utils/logger'

export class AuditService {
    static async log(params: {
        user_id?: string
        action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ'
        entity_type: string
        entity_id: string
        old_values?: unknown
        new_values?: unknown
        request?: Request
        status?: 'success' | 'failed'
        error_message?: string
    }) {
        try {
            await db.insert(auditLogs).values({
                id: crypto.randomUUID(),
                userId: params.user_id,
                action: params.action,
                entityType: params.entity_type,
                entityId: params.entity_id,
                oldValue: params.old_values,
                newValue: params.new_values,
                ipAddress: params.request?.ip,
                userAgent: params.request?.get('user-agent'),
                payload: {
                    status: params.status || 'success',
                    error: params.error_message
                }
            })
        } catch (error) {
            logger.error(error, 'Failed to insert audit log')
        }
    }
}
