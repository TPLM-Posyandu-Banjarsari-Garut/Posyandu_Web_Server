import {
    NotificationsRepository,
    NotificationsQueryFilters
} from '@/repositories/notifications-repository'
import { NewNotification, Notification } from '@/db'
import { ApiError } from '@/utils/api-error'
import { WsManager } from '@/utils/ws-manager'
import { PushSubscriptionsRepository } from '@/repositories/push-subscriptions-repository'
import { PushSubscriptionsService } from '@/services/push-subscriptions-service'
import db from '@/configs/db'
import { logger } from '@/utils/logger'

const pushRepo = new PushSubscriptionsRepository(db)
const pushService = new PushSubscriptionsService(pushRepo)

export class NotificationsService {
    constructor(
        private readonly notifications_repository: NotificationsRepository
    ) {}

    async createNotification(
        data: Omit<
            NewNotification,
            'id' | 'created_at' | 'updated_at' | 'deleted_at'
        >
    ): Promise<Notification> {
        const notification = await this.notifications_repository.create(data)

        WsManager.broadcastNotification(data.user_id, {
            type: 'notification',
            payload: notification
        })

        pushService
            .sendPushNotification(data.user_id, {
                title: data.title,
                body: data.body,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                data: (data.data as Record<string, unknown>) || {}
            })
            .catch(err => {
                logger.warn(
                    { err, userId: data.user_id },
                    '[WebPush] Failed to send push notification'
                )
            })

        return notification
    }

    async getNotifications(filters: NotificationsQueryFilters) {
        return this.notifications_repository.findByUserId(filters)
    }

    async getUnreadCount(user_id: string): Promise<{ count: number }> {
        const count = await this.notifications_repository.countUnread(user_id)
        return { count }
    }

    async markAsRead(id: string, user_id: string): Promise<Notification> {
        const notification = await this.notifications_repository.markAsRead(
            id,
            user_id
        )
        if (!notification) {
            throw ApiError.notFound(
                'Notification not found or does not belong to you'
            )
        }
        return notification
    }

    async markAllAsRead(user_id: string): Promise<{ updated: number }> {
        const updated =
            await this.notifications_repository.markAllAsRead(user_id)
        return { updated }
    }
}
