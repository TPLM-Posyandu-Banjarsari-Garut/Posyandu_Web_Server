import webpush from 'web-push'
import { PushSubscriptionsRepository } from '@/repositories/push-subscriptions-repository'
import { PushSubscription } from '@/db'
import env from '@/configs/env'
import { logger } from '@/utils/logger'

export interface PushNotificationPayload {
    title: string
    body: string
    icon?: string
    badge?: string
    data?: Record<string, unknown>
}

export class PushSubscriptionsService {
    constructor(private readonly repository: PushSubscriptionsRepository) {
        if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
                env.VAPID_SUBJECT || 'mailto:admin@posyandubanjarsari.my.id',
                env.VAPID_PUBLIC_KEY,
                env.VAPID_PRIVATE_KEY
            )
        }
    }

    async subscribe(
        user_id: string,
        endpoint: string,
        p256dh: string,
        auth: string
    ): Promise<PushSubscription> {
        return this.repository.upsert({
            user_id,
            endpoint,
            p256dh,
            auth
        })
    }

    async unsubscribe(endpoint: string): Promise<boolean> {
        return this.repository.deleteByEndpoint(endpoint)
    }

    async sendPushNotification(
        user_id: string,
        payload: PushNotificationPayload
    ): Promise<{ sent: number; failed: number }> {
        if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
            logger.warn('VAPID keys not configured, skipping web push')
            return { sent: 0, failed: 0 }
        }

        const subscriptions = await this.repository.findByUserId(user_id)
        if (subscriptions.length === 0) {
            return { sent: 0, failed: 0 }
        }

        let sent = 0
        let failed = 0

        const pushData = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icon-192x192.png',
            badge: payload.badge || '/icon-192x192.png',
            data: payload.data || {}
        })

        for (const sub of subscriptions) {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            }

            try {
                await webpush.sendNotification(pushSubscription, pushData, {
                    TTL: 86400,
                    urgency: 'high'
                })
                sent++
            } catch (err: unknown) {
                failed++
                logger.error(
                    { err, endpoint: sub.endpoint },
                    'Failed to send web push notification'
                )

                // If subscription expired or invalid (404/410), delete it from DB
                const statusCode = (err as { statusCode?: number }).statusCode
                if (statusCode === 404 || statusCode === 410) {
                    await this.repository.deleteByEndpoint(sub.endpoint)
                }
            }
        }

        return { sent, failed }
    }
}
