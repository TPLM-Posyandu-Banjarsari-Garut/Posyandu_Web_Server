import { Request, Response, NextFunction } from 'express'
import db from '@/configs/db'
import { auditLogs } from '@/db/schemas/audit-logs-schema'
import { logger } from '@/utils/logger'

const SENSITIVE_KEYS = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'authorization',
    'cookie'
]

const ENTITY_TYPE_MAP: Record<string, string> = {
    consultations: 'consultation',
    users: 'user',
    parents: 'parent',
    midwifes: 'midwife',
    cadres: 'cadre',
    posyandus: 'posyandu',
    childrens: 'children',
    notifications: 'notification',
    'immunization-records': 'immunization_record',
    'vitamin-records': 'vitamin_record',
    'nutrition-records': 'nutrition_record',
    'kipi-details': 'kipi_detail',
    inventories: 'inventory',
    vaccines: 'vaccine',
    vitamins: 'vitamin',
    educations: 'education'
}

function extractEntityType(url: string): string | null {
    const match = new RegExp(/\/api\/([^/?]+)/).exec(url)
    if (!match) return null
    return ENTITY_TYPE_MAP[match[1]] ?? match[1].replaceAll('-', '_')
}

function extractEntityId(req: Request): string | null {
    return (
        (req.params.public_id as string | undefined) ||
        (req.params.id as string | undefined) ||
        null
    )
}

const censorPayload = (data: unknown): unknown => {
    if (!data || typeof data !== 'object') return data

    const censored = { ...(data as Record<string, unknown>) }
    for (const key of Object.keys(censored)) {
        if (
            SENSITIVE_KEYS.some(sensitiveKey =>
                key.toLowerCase().includes(sensitiveKey.toLowerCase())
            )
        ) {
            censored[key] = '[REDACTED]'
        } else if (
            typeof censored[key] === 'object' &&
            censored[key] !== null
        ) {
            censored[key] = censorPayload(censored[key])
        }
    }
    return censored
}

export const autoAuditMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)

    if (!isMutation) {
        return next()
    }

    const payload = req.body ? censorPayload(req.body) : null
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || ''
    const userAgent = req.headers['user-agent'] || ''
    const action = `${req.method} ${req.originalUrl || req.url}`
    const entityType = extractEntityType(req.originalUrl || req.url)
    const entityId = extractEntityId(req)

    let capturedNewValue: unknown = null
    const originalJson = res.json.bind(res)
    res.json = (body: unknown) => {
        const parsed =
            body && typeof body === 'object'
                ? (body as Record<string, unknown>)
                : null
        capturedNewValue = parsed?.data ?? null
        return originalJson(body)
    }

    res.on('finish', () => {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300

        if (isSuccess) {
            const userId = res.locals.user?.id || null

            db.insert(auditLogs)
                .values({
                    userId,
                    action,
                    entityType,
                    entityId,
                    newValue: capturedNewValue,
                    ipAddress,
                    userAgent,
                    payload,
                    statusCode: res.statusCode
                })
                .then(() => {
                    logger.debug(
                        { action, userId, entityType, entityId },
                        'Audit log saved successfully'
                    )
                })
                .catch((error: unknown) => {
                    logger.error(
                        { error, action, userId },
                        'Failed to save audit log'
                    )
                })
        }
    })

    next()
}
