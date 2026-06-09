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

    res.on('finish', () => {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300

        if (isSuccess) {
            const userId = res.locals.user?.id || null

            db.insert(auditLogs)
                .values({
                    userId,
                    action,
                    ipAddress,
                    userAgent,
                    payload,
                    statusCode: res.statusCode
                })
                .then(() => {
                    logger.debug(
                        { action, userId },
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
