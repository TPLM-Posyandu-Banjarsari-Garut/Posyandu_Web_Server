import { createPaginationMeta } from '@/utils/pagination'
import {
    NewExaminationSchedule,
    ExaminationSchedule,
    posyandus,
    examinations
} from '@/db'
import {
    ExaminationSchedulesRepository,
    ExaminationSchedulesQueryFilters
} from '@/repositories/examination-schedules-repository'
import { ApiError } from '@/utils/api-error'
import db from '@/configs/db'
import { eq } from 'drizzle-orm'
import { NotificationsRepository } from '@/repositories/notifications-repository'
import { NotificationsService } from '@/services/notifications-service'

import { PushSubscriptionsRepository } from '@/repositories/push-subscriptions-repository'
import { PushSubscriptionsService } from '@/services/push-subscriptions-service'
import { logger } from '@/utils/logger'

const notificationsRepository = new NotificationsRepository(db)
const notificationsService = new NotificationsService(notificationsRepository)
const pushSubscriptionsRepository = new PushSubscriptionsRepository(db)
const pushSubscriptionsService = new PushSubscriptionsService(
    pushSubscriptionsRepository
)

export class ExaminationSchedulesService {
    constructor(
        private readonly schedules_repository: ExaminationSchedulesRepository
    ) {}

    async createSchedule(
        payload: NewExaminationSchedule
    ): Promise<ExaminationSchedule> {
        const existing = await this.schedules_repository.getSchedules({
            posyandu_id: payload.posyandu_id,
            examination_id: payload.examination_id,
            scheduled_date: payload.scheduled_date,
            limit: 1
        })
        if (existing.data.length > 0) {
            throw ApiError.conflict(
                'An examination schedule for this template on the same date already exists'
            )
        }
        return this.schedules_repository.create(payload)
    }

    async getSchedules(filters?: ExaminationSchedulesQueryFilters) {
        const { page = 1, limit = 10 } = filters || {}
        const { data, totalItems } =
            await this.schedules_repository.getSchedules(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getScheduleById(id: string): Promise<ExaminationSchedule> {
        const record = await this.schedules_repository.findById(id)
        if (!record) throw ApiError.notFound('Examination schedule not found')
        return record
    }

    async updateSchedule(
        id: string,
        payload: Partial<NewExaminationSchedule>
    ): Promise<ExaminationSchedule> {
        await this.getScheduleById(id)
        const updated = await this.schedules_repository.update(id, payload)
        if (!updated)
            throw ApiError.server('Failed to update examination schedule')
        return updated
    }

    async deleteSchedule(
        id: string,
        isPermanent = false
    ): Promise<ExaminationSchedule> {
        await this.getScheduleById(id)
        const deleted = isPermanent
            ? await this.schedules_repository.hardDelete(id)
            : await this.schedules_repository.softDelete(id)

        if (!deleted)
            throw ApiError.server('Failed to delete examination schedule')
        return deleted
    }

    async restoreSchedule(id: string): Promise<ExaminationSchedule> {
        const restored = await this.schedules_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore examination schedule')
        return restored
    }

    async broadcastScheduleNotification(
        id: string,
        custom_message?: string
    ): Promise<{ recipient_count: number; title: string; body: string }> {
        const schedule = await this.getScheduleById(id)

        const [posyanduRow] = await db
            .select({ name: posyandus.name })
            .from(posyandus)
            .where(eq(posyandus.id, schedule.posyandu_id))
            .limit(1)

        const [examRow] = await db
            .select({ name: examinations.name })
            .from(examinations)
            .where(eq(examinations.id, schedule.examination_id))
            .limit(1)

        const posyanduName = posyanduRow?.name || 'Posyandu'
        const examName = examRow?.name || 'Pemeriksaan Posyandu'
        const scheduledDateStr = schedule.scheduled_date
            ? new Date(schedule.scheduled_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              })
            : ''
        const timeStr =
            schedule.start_time && schedule.end_time
                ? ` (pukul ${schedule.start_time} - ${schedule.end_time})`
                : ''

        const title = `📢 Pengingat Jadwal Posyandu ${posyanduName}`
        const body =
            custom_message && custom_message.trim().length > 0
                ? custom_message
                : `Jadwal ${examName} akan dilaksanakan pada ${scheduledDateStr}${timeStr}. Mohon hadir tepat waktu!`

        const parentUserIds =
            await this.schedules_repository.getParentUserIdsByPosyanduId(
                schedule.posyandu_id
            )

        if (parentUserIds.length === 0) {
            return {
                recipient_count: 0,
                title,
                body
            }
        }

        for (const user_id of parentUserIds) {
            await notificationsService.createNotification({
                user_id,
                type: 'examination',
                status: 'unread',
                title,
                body,
                data: {
                    consultation_id: schedule.id,
                    posyandu_name: posyanduName,
                    scheduled_at: schedule.scheduled_date
                        ? new Date(schedule.scheduled_date).toISOString()
                        : undefined
                }
            })

            // Trigger Web Push Notification for offline browser delivery
            pushSubscriptionsService
                .sendPushNotification(user_id, {
                    title,
                    body,
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    data: {
                        consultation_id: schedule.id,
                        posyandu_name: posyanduName
                    }
                })
                .catch(err => {
                    // Log and continue, do not block the loop
                    logger.warn(
                        { err, userId: user_id },
                        '[WebPush] Failed to send push to user'
                    )
                })
        }

        return {
            recipient_count: parentUserIds.length,
            title,
            body
        }
    }
}
