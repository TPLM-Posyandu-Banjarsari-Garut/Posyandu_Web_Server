import { Router } from 'express'
import { verifyAuth } from '@/middlewares/verify-auth'
import { authorizeRoles } from '@/middlewares/authorize-role'
import { AsyncHandler } from '@/utils/async-handler'
import { NotificationsController } from '@/controllers/notifications-controller'
import { NotificationsService } from '@/services/notifications-service'
import { NotificationsRepository } from '@/repositories/notifications-repository'
import db from '@/configs/db'

const router = Router()

const notifications_repository = new NotificationsRepository(db)
const notifications_service = new NotificationsService(notifications_repository)
const notifications_controller = new NotificationsController(
    notifications_service
)

router.get(
    '/',
    verifyAuth,
    authorizeRoles(
        'posyandu_admin',
        'village_admin',
        'parent',
        'midwife',
        'cadre'
    ),
    AsyncHandler(notifications_controller.getNotifications)
)

router.get(
    '/unread-count',
    verifyAuth,
    authorizeRoles(
        'posyandu_admin',
        'village_admin',
        'parent',
        'midwife',
        'cadre'
    ),
    AsyncHandler(notifications_controller.getUnreadCount)
)

router.put(
    '/read-all',
    verifyAuth,
    authorizeRoles(
        'posyandu_admin',
        'village_admin',
        'parent',
        'midwife',
        'cadre'
    ),
    AsyncHandler(notifications_controller.markAllAsRead)
)

router.put(
    '/:id/read',
    verifyAuth,
    authorizeRoles(
        'posyandu_admin',
        'village_admin',
        'parent',
        'midwife',
        'cadre'
    ),
    AsyncHandler(notifications_controller.markAsRead)
)

export default router
