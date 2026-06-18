import { Request, Response } from 'express'
import { NotificationsService } from '@/services/notifications-service'
import { ApiResponse } from '@/utils/api-response'

export class NotificationsController {
    constructor(private readonly notifications_service: NotificationsService) {}

    getNotifications = async (req: Request, res: Response) => {
        const user = res.locals.user
        const { status, page, limit } = req.query as {
            status?: 'unread' | 'read'
            page?: string
            limit?: string
        }

        const result = await this.notifications_service.getNotifications({
            user_id: user.id,
            status,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        })

        return ApiResponse.ok(
            res,
            'Notifications retrieved successfully',
            result
        )
    }

    getUnreadCount = async (_req: Request, res: Response) => {
        const user = res.locals.user
        const result = await this.notifications_service.getUnreadCount(user.id)
        return ApiResponse.ok(res, 'Unread count retrieved', result)
    }

    markAsRead = async (req: Request, res: Response) => {
        const user = res.locals.user
        const id = req.params['id'] as string
        const notification = await this.notifications_service.markAsRead(
            id,
            user.id
        )
        return ApiResponse.ok(res, 'Notification marked as read', notification)
    }

    markAllAsRead = async (_req: Request, res: Response) => {
        const user = res.locals.user
        const result = await this.notifications_service.markAllAsRead(user.id)
        return ApiResponse.ok(
            res,
            `${result.updated} notifications marked as read`,
            result
        )
    }
}
