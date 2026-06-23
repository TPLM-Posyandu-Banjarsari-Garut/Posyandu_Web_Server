import db from '@/configs/db'
import {
    verifications,
    sessions,
    consultations,
    parents,
    users,
    posyandus
} from '@/db'
import { lt, sql, and, gte, lte, eq, ne } from 'drizzle-orm'
import { logger } from '@/utils/logger'
import { EmailService } from '@/services/email-service'
import { NotificationsRepository } from '@/repositories/notifications-repository'
import { NotificationsService } from '@/services/notifications-service'

const notificationsRepository = new NotificationsRepository(db)
const notificationsService = new NotificationsService(notificationsRepository)

async function getBookingWithParentUser(consultation_id: string) {
    const [row] = await db
        .select({
            consultation_id: consultations.id,
            consultation_type: consultations.consultation_type,
            scheduled_at: consultations.scheduled_at,
            follow_up_date: consultations.follow_up_date,
            follow_up_required: consultations.follow_up_required,
            parent_user_id: parents.user_id,
            parent_name: users.name,
            parent_email: users.email,
            posyandu_name: posyandus.name
        })
        .from(consultations)
        .innerJoin(parents, eq(consultations.parent_id, parents.id))
        .innerJoin(users, eq(parents.user_id, users.id))
        .innerJoin(posyandus, eq(consultations.posyandu_id, posyandus.id))
        .where(eq(consultations.id, consultation_id))
        .limit(1)
    return row
}

async function getQueueNumber(
    posyandu_id: string,
    consultation_type: 'pregnancy' | 'child_development' | 'general',
    scheduled_at: Date,
    created_at: Date
): Promise<number> {
    const targetDate = new Date(scheduled_at)
    const startOfDay = new Date(
        Date.UTC(
            targetDate.getUTCFullYear(),
            targetDate.getUTCMonth(),
            targetDate.getUTCDate()
        )
    )
    const endOfDay = new Date(
        Date.UTC(
            targetDate.getUTCFullYear(),
            targetDate.getUTCMonth(),
            targetDate.getUTCDate(),
            23,
            59,
            59,
            999
        )
    )
    const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(consultations)
        .where(
            and(
                eq(consultations.posyandu_id, posyandu_id),
                eq(consultations.consultation_type, consultation_type),
                gte(consultations.scheduled_at, startOfDay),
                lte(consultations.scheduled_at, endOfDay),
                sql`${consultations.deleted_at} IS NULL`,
                ne(consultations.status, 'cancelled'),
                lte(consultations.created_at, created_at)
            )
        )
    return Number(result?.count || 1)
}

export class CronService {
    static async runKeepAlive(): Promise<void> {
        try {
            await db.execute(sql`SELECT 1`)
        } catch (error) {
            logger.error(error, '❌ DB Keep-Alive ping failed')
        }
    }

    static async runDailyCleanup(): Promise<void> {
        try {
            logger.info('🧹 Starting daily cleanup...')
            const now = new Date()
            const [deletedVerifications, deletedSessions] = await Promise.all([
                db
                    .delete(verifications)
                    .where(lt(verifications.expires_at, now))
                    .returning(),
                db
                    .delete(sessions)
                    .where(lt(sessions.expires_at, now))
                    .returning()
            ])
            const deletedNotifs =
                await notificationsRepository.deleteOlderThan(90)
            logger.info(
                `✅ Cleanup done. Verifications: ${deletedVerifications.length}, Sessions: ${deletedSessions.length}, Notifications: ${deletedNotifs}`
            )
        } catch (error) {
            logger.error(error, '❌ Error during daily cleanup')
        }
    }

    static async runBookingReminderH1(): Promise<void> {
        try {
            const now = new Date()
            const from = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            const to = new Date(now.getTime() + 25 * 60 * 60 * 1000)

            const upcomingBookings = await db
                .select({
                    id: consultations.id,
                    posyandu_id: consultations.posyandu_id,
                    consultation_type: consultations.consultation_type,
                    scheduled_at: consultations.scheduled_at,
                    created_at: consultations.created_at
                })
                .from(consultations)
                .where(
                    and(
                        gte(consultations.scheduled_at, from),
                        lte(consultations.scheduled_at, to),
                        ne(consultations.status, 'cancelled'),
                        ne(consultations.status, 'completed'),
                        sql`${consultations.deleted_at} IS NULL`
                    )
                )

            logger.info(
                `📧 Sending H-1 reminders for ${upcomingBookings.length} bookings`
            )

            for (const booking of upcomingBookings) {
                const detail = await getBookingWithParentUser(booking.id)
                if (!detail) continue
                const queueNumber = await getQueueNumber(
                    booking.posyandu_id,
                    booking.consultation_type,
                    booking.scheduled_at,
                    booking.created_at
                )
                await EmailService.sendBookingReminderH1(detail.parent_email, {
                    parentName: detail.parent_name,
                    consultationType: booking.consultation_type,
                    scheduledAt: booking.scheduled_at,
                    posyanduName: detail.posyandu_name,
                    queueNumber
                }).catch(err =>
                    logger.error(err, `Failed H-1 reminder for ${booking.id}`)
                )
                await notificationsService
                    .createNotification({
                        user_id: detail.parent_user_id,
                        type: 'consultation',
                        status: 'unread',
                        title: '⏰ Pengingat: Konsultasi Besok!',
                        body: `Konsultasi Anda dijadwalkan besok. Nomor antrean: #${queueNumber}`,
                        data: {
                            consultation_id: booking.id,
                            scheduled_at: booking.scheduled_at.toISOString(),
                            queue_number: queueNumber,
                            consultation_type: booking.consultation_type,
                            posyandu_name: detail.posyandu_name
                        }
                    })
                    .catch(err =>
                        logger.error(err, `Failed H-1 notif for ${booking.id}`)
                    )
            }
        } catch (error) {
            logger.error(error, '❌ Booking H-1 reminder cron failed')
        }
    }

    static async runBookingReminder2h(): Promise<void> {
        try {
            const now = new Date()
            const from = new Date(now.getTime() + 2 * 60 * 60 * 1000)
            const to = new Date(now.getTime() + 2.5 * 60 * 60 * 1000)
            const upcomingBookings = await db
                .select({
                    id: consultations.id,
                    posyandu_id: consultations.posyandu_id,
                    consultation_type: consultations.consultation_type,
                    scheduled_at: consultations.scheduled_at,
                    created_at: consultations.created_at
                })
                .from(consultations)
                .where(
                    and(
                        gte(consultations.scheduled_at, from),
                        lte(consultations.scheduled_at, to),
                        ne(consultations.status, 'cancelled'),
                        ne(consultations.status, 'completed'),
                        sql`${consultations.deleted_at} IS NULL`
                    )
                )
            for (const booking of upcomingBookings) {
                const detail = await getBookingWithParentUser(booking.id)
                if (!detail) continue
                const queueNumber = await getQueueNumber(
                    booking.posyandu_id,
                    booking.consultation_type,
                    booking.scheduled_at,
                    booking.created_at
                )
                await EmailService.sendBookingReminder2h(detail.parent_email, {
                    parentName: detail.parent_name,
                    consultationType: booking.consultation_type,
                    scheduledAt: booking.scheduled_at,
                    posyanduName: detail.posyandu_name,
                    queueNumber
                }).catch(err =>
                    logger.error(err, `Failed 2h reminder for ${booking.id}`)
                )
            }
        } catch (error) {
            logger.error(error, '❌ Booking 2h reminder cron failed')
        }
    }

    static async runBookingAutoExpire(): Promise<void> {
        try {
            const expiryCutoff = new Date(Date.now() - 60 * 60 * 1000)
            const expired = await db
                .update(consultations)
                .set({
                    status: 'cancelled',
                    cancellation_reason:
                        'Automatically cancelled: patient no-show'
                })
                .where(
                    and(
                        lt(consultations.scheduled_at, expiryCutoff),
                        eq(consultations.status, 'pending'),
                        sql`${consultations.deleted_at} IS NULL`
                    )
                )
                .returning({ id: consultations.id })
            if (expired.length > 0) {
                logger.info(
                    `⏰ Auto-expired ${expired.length} no-show bookings`
                )
            }
        } catch (error) {
            logger.error(error, '❌ Booking auto-expire cron failed')
        }
    }

    static async runBookingFollowUp(): Promise<void> {
        try {
            const now = new Date()
            const tomorrowStart = new Date(
                Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate() + 1
                )
            )
            const tomorrowEnd = new Date(
                Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate() + 2
                )
            )
            const followUps = await db
                .select({
                    id: consultations.id,
                    consultation_type: consultations.consultation_type,
                    follow_up_date: consultations.follow_up_date,
                    posyandu_id: consultations.posyandu_id
                })
                .from(consultations)
                .where(
                    and(
                        eq(consultations.follow_up_required, true),
                        gte(consultations.follow_up_date, tomorrowStart),
                        lt(consultations.follow_up_date, tomorrowEnd),
                        sql`${consultations.deleted_at} IS NULL`
                    )
                )
            logger.info(
                `🩺 Sending follow-up reminders for ${followUps.length} bookings`
            )
            for (const booking of followUps) {
                const detail = await getBookingWithParentUser(booking.id)
                if (!detail || !booking.follow_up_date) continue
                await EmailService.sendBookingFollowUpReminder(
                    detail.parent_email,
                    {
                        parentName: detail.parent_name,
                        consultationType: booking.consultation_type,
                        followUpDate: booking.follow_up_date,
                        posyanduName: detail.posyandu_name
                    }
                ).catch(err =>
                    logger.error(
                        err,
                        `Failed follow-up reminder for ${booking.id}`
                    )
                )
            }
        } catch (error) {
            logger.error(error, '❌ Follow-up reminder cron failed')
        }
    }

    static async triggerCronJobs(taskName?: string): Promise<void> {
        logger.info(
            `⏰ Triggering cron jobs via HTTP endpoint. Task: ${taskName || 'auto (time-based)'}`
        )

        if (taskName) {
            switch (taskName) {
                case 'keep-alive':
                    await this.runKeepAlive()
                    break
                case 'reminder-2h':
                    await this.runBookingReminder2h()
                    break
                case 'reminder-h1':
                    await this.runBookingReminderH1()
                    break
                case 'auto-expire':
                    await this.runBookingAutoExpire()
                    break
                case 'daily-cleanup':
                    await this.runDailyCleanup()
                    break
                case 'follow-up':
                    await this.runBookingFollowUp()
                    break
                default:
                    logger.warn(`Unknown cron task requested: ${taskName}`)
                    break
            }
            return
        }

        const now = new Date()
        const minute = now.getUTCMinutes()
        const hour = now.getUTCHours()

        await this.runKeepAlive()
        await this.runBookingReminder2h()

        if (minute >= 0 && minute < 30) {
            await this.runBookingReminderH1()
        } else {
            await this.runBookingAutoExpire()
        }

        if (hour === 0 && minute >= 0 && minute < 30) {
            await this.runDailyCleanup()
        }
        if (hour === 1 && minute >= 0 && minute < 30) {
            await this.runBookingFollowUp()
        }
    }
}
