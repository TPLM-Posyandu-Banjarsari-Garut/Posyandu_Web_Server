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
        request?: Request
        status?: 'success' | 'failed'
    }) {
        try {
            await db.insert(auditLogs).values({
                id: crypto.randomUUID(),
                userId: params.user_id,
                action: params.action,
                entityType: params.entity_type,
                entityId: params.entity_id,
                ipAddress: params.request?.ip,
                userAgent: params.request?.get('user-agent'),
                payload: {
                    status: params.status || 'success'
                }
            })
        } catch (error) {
            logger.error(
                {
                    errorType:
                        error instanceof Error ? error.name : 'UnknownError'
                },
                'Failed to insert audit log'
            )
        }
    }
}
