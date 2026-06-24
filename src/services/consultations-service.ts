import {
    ConsultationsRepository,
    ConsultationsQueryFilters
} from '@/repositories/consultations-repository'
import {
    Consultation,
    NewConsultation,
    childrens,
    pregnancyRecords,
    relationChildrens,
    consultations,
    parents,
    users,
    posyandus
} from '@/db'
import { ApiError } from '@/utils/api-error'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { and, or, eq, ne, gte, lte, sql } from 'drizzle-orm'
import db from '@/configs/db'
import {
    GENERAL_CONSULTATION_SLOTS,
    EXAMINATION_SLOTS
} from '@/constants/booking-schedules'
import { cadres } from '@/db/schemas/cadres-schema'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { redis } from '@/configs/redis'
import { logger } from '@/utils/logger'
import {
    EmailService,
    formatDateId,
    labelConsultationType
} from '@/services/email-service'
import { WsManager } from '@/utils/ws-manager'
import { NotificationsService } from '@/services/notifications-service'
import { NotificationsRepository } from '@/repositories/notifications-repository'

type ConsultationType = 'pregnancy' | 'child_development' | 'general'

export class ConsultationsService {
    private readonly notifications_service: NotificationsService

    constructor(
        private readonly consultations_repository: ConsultationsRepository,
        private readonly dbInstance: NodePgDatabase = db
    ) {
        const notificationsRepository = new NotificationsRepository(
            this.dbInstance
        )
        this.notifications_service = new NotificationsService(
            notificationsRepository
        )
    }

    private async resolvePregnancyPosyandu(
        parent_id: string,
        pregnancy_record_id: string | null | undefined
    ): Promise<string> {
        if (!pregnancy_record_id) {
            throw ApiError.badRequest(
                'Pregnancy record ID is required for pregnancy consultation'
            )
        }
        const [pregRecord] = await this.dbInstance
            .select()
            .from(pregnancyRecords)
            .where(
                and(
                    eq(pregnancyRecords.id, pregnancy_record_id),
                    eq(pregnancyRecords.parent_id, parent_id)
                )
            )
            .limit(1)

        if (!pregRecord) {
            throw ApiError.forbidden(
                'Access denied or pregnancy record not found'
            )
        }
        return pregRecord.posyandu_id
    }

    private async resolveChildDevelopmentPosyandu(
        parent_id: string,
        children_id: string | null | undefined
    ): Promise<string> {
        if (!children_id) {
            throw ApiError.badRequest(
                'Children ID is required for child development consultation'
            )
        }
        const [association] = await this.dbInstance
            .select()
            .from(relationChildrens)
            .where(
                and(
                    eq(relationChildrens.parent_id, parent_id),
                    eq(relationChildrens.children_id, children_id)
                )
            )
            .limit(1)

        if (!association) {
            throw ApiError.forbidden(
                'Access denied. Child is not associated with this parent.'
            )
        }

        const [child] = await this.dbInstance
            .select({ posyandu_id: childrens.posyandu_id })
            .from(childrens)
            .where(eq(childrens.id, children_id))
            .limit(1)

        if (!child) {
            throw ApiError.notFound('Child record not found')
        }
        return child.posyandu_id
    }

    private async resolveGeneralPosyandu(
        parent_id: string,
        posyandu_id: string | null | undefined
    ): Promise<string | null> {
        if (posyandu_id) {
            return posyandu_id
        }
        const [childRel] = await this.dbInstance
            .select({ posyandu_id: childrens.posyandu_id })
            .from(relationChildrens)
            .innerJoin(
                childrens,
                eq(relationChildrens.children_id, childrens.id)
            )
            .where(eq(relationChildrens.parent_id, parent_id))
            .limit(1)

        if (childRel) {
            return childRel.posyandu_id
        }

        const [pregRec] = await this.dbInstance
            .select({ posyandu_id: pregnancyRecords.posyandu_id })
            .from(pregnancyRecords)
            .where(eq(pregnancyRecords.parent_id, parent_id))
            .limit(1)

        if (pregRec) {
            return pregRec.posyandu_id
        }

        return null
    }

    async batchEnrichWithQueueNumbers(
        consultationItems: Consultation[]
    ): Promise<(Consultation & { queue_number: number })[]> {
        if (consultationItems.length === 0) return []

        const uniqueCombos = new Map<
            string,
            {
                posyandu_id: string
                consultation_type: ConsultationType
                startOfDay: Date
                endOfDay: Date
            }
        >()
        for (const item of consultationItems) {
            const targetDate = new Date(item.scheduled_at)
            const startOfDay = new Date(
                Date.UTC(
                    targetDate.getUTCFullYear(),
                    targetDate.getUTCMonth(),
                    targetDate.getUTCDate(),
                    0,
                    0,
                    0,
                    0
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
            const key = `${item.posyandu_id}_${item.consultation_type}_${startOfDay.toISOString()}`
            if (!uniqueCombos.has(key)) {
                uniqueCombos.set(key, {
                    posyandu_id: item.posyandu_id,
                    consultation_type: item.consultation_type,
                    startOfDay,
                    endOfDay
                })
            }
        }

        const orConditions = Array.from(uniqueCombos.values()).map(combo =>
            and(
                eq(consultations.posyandu_id, combo.posyandu_id),
                eq(consultations.consultation_type, combo.consultation_type),
                gte(consultations.scheduled_at, combo.startOfDay),
                lte(consultations.scheduled_at, combo.endOfDay)
            )
        )

        const allMatchingBookings = await this.dbInstance
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
                    orConditions.length > 1
                        ? or(...orConditions)
                        : orConditions[0],
                    sql`${consultations.deleted_at} IS NULL`,
                    ne(consultations.status, 'cancelled')
                )
            )

        const isSameUTCDay = (d1: Date, d2: Date) => {
            return (
                d1.getUTCFullYear() === d2.getUTCFullYear() &&
                d1.getUTCMonth() === d2.getUTCMonth() &&
                d1.getUTCDate() === d2.getUTCDate()
            )
        }

        return consultationItems.map(item => {
            const itemDate = new Date(item.scheduled_at)
            const matches = allMatchingBookings.filter(
                booking =>
                    booking.posyandu_id === item.posyandu_id &&
                    booking.consultation_type === item.consultation_type &&
                    isSameUTCDay(new Date(booking.scheduled_at), itemDate) &&
                    new Date(booking.created_at).getTime() <=
                        new Date(item.created_at).getTime()
            )
            return {
                ...item,
                queue_number: matches.length || 1
            }
        })
    }

    private async enrichWithQueueNumber(
        consultation: Consultation
    ): Promise<Consultation & { queue_number: number }> {
        const [enriched] = await this.batchEnrichWithQueueNumbers([
            consultation
        ])
        return enriched
    }

    private async getBookingDetails(consultationId: string) {
        const [row] = await this.dbInstance
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
            .where(eq(consultations.id, consultationId))
            .limit(1)
        return row
    }

    private async getOfficerName(actor: {
        role: string
        midwife_id?: string
        cadre_id?: string
    }): Promise<string | undefined> {
        if (actor.role === 'midwife' && actor.midwife_id) {
            const [row] = await this.dbInstance
                .select({ name: users.name })
                .from(midwifes)
                .innerJoin(users, eq(midwifes.user_id, users.id))
                .where(eq(midwifes.id, actor.midwife_id))
                .limit(1)
            return row?.name
        }
        if (actor.role === 'cadre' && actor.cadre_id) {
            const [row] = await this.dbInstance
                .select({ name: users.name })
                .from(cadres)
                .innerJoin(users, eq(cadres.user_id, users.id))
                .where(eq(cadres.id, actor.cadre_id))
                .limit(1)
            return row?.name
        }
        return undefined
    }

    private async invalidateSlotsCache(
        posyandu_id: string,
        consultation_type: string,
        scheduled_at: Date,
        midwife_id?: string | null
    ): Promise<void> {
        if (!redis) return
        try {
            const dateString = scheduled_at.toISOString().split('T')[0]
            const baseKey = `slots:${posyandu_id}:${consultation_type}:${dateString}`
            await redis.del(baseKey)
            if (midwife_id) {
                await redis.del(`${baseKey}:${midwife_id}`)
            }
            logger.debug({ dateString, midwife_id }, 'Invalidated slot availability cache')
        } catch (err) {
            logger.error(err, 'Failed to invalidate slots cache')
        }
    }

    private validateScheduledAt(
        consultation_type: ConsultationType,
        scheduled_at: Date
    ): void {
        const now = new Date()
        const startOfToday = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                0,
                0,
                0,
                0
            )
        )
        const endOfLusa = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + 2,
                23,
                59,
                59,
                999
            )
        )

        if (
            scheduled_at.getTime() < startOfToday.getTime() ||
            scheduled_at.getTime() > endOfLusa.getTime()
        ) {
            throw ApiError.badRequest(
                'Booking is only allowed for today, tomorrow, and the day after tomorrow'
            )
        }

        const utcHours = scheduled_at.getUTCHours()
        const utcMinutes = scheduled_at.getUTCMinutes()
        const timeStr = `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}`

        const allowedSlots: readonly string[] =
            consultation_type === 'general'
                ? GENERAL_CONSULTATION_SLOTS
                : EXAMINATION_SLOTS

        if (!allowedSlots.includes(timeStr)) {
            throw ApiError.badRequest(
                `Invalid scheduled time. For ${consultation_type}, allowed timeslots are: ${allowedSlots.join(', ')}`
            )
        }
    }

    async getAvailableSlots(
        posyandu_id: string,
        consultation_type: ConsultationType,
        dateString: string,
        midwife_id?: string | null
    ): Promise<{ time: string; available: boolean }[]> {
        const cacheKey = midwife_id
            ? `slots:${posyandu_id}:${consultation_type}:${dateString}:${midwife_id}`
            : `slots:${posyandu_id}:${consultation_type}:${dateString}`
        if (redis) {
            try {
                const cached = await redis.get<unknown[]>(cacheKey)
                if (cached) {
                    return cached as { time: string; available: boolean }[]
                }
            } catch (err) {
                logger.error(err, 'Redis get error')
            }
        }

        const dateParts = dateString.split('-')
        if (dateParts.length !== 3) {
            throw ApiError.badRequest(
                'Invalid date format. Expected YYYY-MM-DD'
            )
        }
        const year = Number.parseInt(dateParts[0], 10)
        const month = Number.parseInt(dateParts[1], 10) - 1
        const day = Number.parseInt(dateParts[2], 10)

        const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
        const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999))

        const conditions = [
            gte(consultations.scheduled_at, startOfDay),
            lte(consultations.scheduled_at, endOfDay),
            sql`${consultations.deleted_at} IS NULL`,
            ne(consultations.status, 'cancelled')
        ]

        if (midwife_id) {
            conditions.push(eq(consultations.midwife_id, midwife_id))
        } else {
            conditions.push(
                eq(consultations.posyandu_id, posyandu_id),
                eq(consultations.consultation_type, consultation_type)
            )
        }

        const activeBookings = await this.dbInstance
            .select({ scheduled_at: consultations.scheduled_at })
            .from(consultations)
            .where(and(...conditions))

        const timeslots =
            consultation_type === 'general'
                ? GENERAL_CONSULTATION_SLOTS
                : EXAMINATION_SLOTS

        const now = new Date()

        const result = timeslots.map(timeStr => {
            const [hours, minutes] = timeStr.split(':').map(Number)
            const slotDate = new Date(
                Date.UTC(year, month, day, hours, minutes, 0, 0)
            )

            const isPast = slotDate.getTime() <= now.getTime()
            const isBooked = activeBookings.some(
                booking => booking.scheduled_at.getTime() === slotDate.getTime()
            )

            return {
                time: timeStr,
                available: !isPast && !isBooked
            }
        })

        if (redis) {
            try {
                await redis.set(cacheKey, result, { ex: 30 })
            } catch (err) {
                logger.error(err, 'Redis set error')
            }
        }

        return result
    }

    async createBooking(
        parent_id: string,
        payload: {
            consultation_type: ConsultationType
            scheduled_at: Date | Date[]
            pregnancy_record_id?: string | null
            children_id?: string | null
            notes?: string | null
            posyandu_id?: string | null
            midwife_id?: string | null
        }
    ): Promise<
        | (Consultation & { queue_number: number })
        | (Consultation & { queue_number: number })[]
    > {
        const dates = Array.isArray(payload.scheduled_at)
            ? payload.scheduled_at
            : [payload.scheduled_at]
        for (const date of dates) {
            this.validateScheduledAt(payload.consultation_type, date)
        }

        let derivedPosyanduId: string | null = null

        if (payload.consultation_type === 'pregnancy') {
            derivedPosyanduId = await this.resolvePregnancyPosyandu(
                parent_id,
                payload.pregnancy_record_id
            )
        } else if (payload.consultation_type === 'child_development') {
            derivedPosyanduId = await this.resolveChildDevelopmentPosyandu(
                parent_id,
                payload.children_id
            )
        } else {
            derivedPosyanduId = await this.resolveGeneralPosyandu(
                parent_id,
                payload.posyandu_id
            )
        }

        if (!derivedPosyanduId) {
            throw ApiError.badRequest(
                'Posyandu ID could not be determined. Please specify it.'
            )
        }

        const finalPosyanduId = derivedPosyanduId

        const results = await this.dbInstance.transaction(async tx => {
            const createdBookings = []
            for (const schedDate of dates) {
                const conditions = [
                    eq(consultations.scheduled_at, schedDate),
                    sql`${consultations.deleted_at} IS NULL`,
                    ne(consultations.status, 'cancelled')
                ]

                if (payload.midwife_id) {
                    conditions.push(eq(consultations.midwife_id, payload.midwife_id))
                } else {
                    conditions.push(
                        eq(consultations.posyandu_id, finalPosyanduId),
                        eq(
                            consultations.consultation_type,
                            payload.consultation_type
                        )
                    )
                }

                const existingBooking = await tx
                    .select()
                    .from(consultations)
                    .where(and(...conditions))
                    .limit(1)

                if (existingBooking.length > 0) {
                    throw ApiError.badRequest(
                        `The timeslot ${schedDate.toISOString()} is already booked and unavailable`
                    )
                }

                const newBooking: NewConsultation = {
                    parent_id,
                    posyandu_id: finalPosyanduId,
                    consultation_type: payload.consultation_type,
                    scheduled_at: schedDate,
                    pregnancy_record_id: payload.pregnancy_record_id || null,
                    children_id: payload.children_id || null,
                    notes: payload.notes || null,
                    midwife_id: payload.midwife_id || null,
                    status: 'pending'
                }

                const [created] = await tx
                    .insert(consultations)
                    .values(newBooking)
                    .returning()
                createdBookings.push(created)
            }
            return createdBookings
        })

        const enrichedBookings = []
        for (const created of results) {
            const enriched = await this.enrichWithQueueNumber(created)
            enrichedBookings.push(enriched)

            await this.invalidateSlotsCache(
                finalPosyanduId,
                payload.consultation_type,
                created.scheduled_at,
                payload.midwife_id
            )

            try {
                const dateString = created.scheduled_at
                    .toISOString()
                    .split('T')[0]
                WsManager.broadcastSlotUpdate(
                    finalPosyanduId,
                    payload.consultation_type,
                    dateString
                )
            } catch (err) {
                logger.error(err, 'WebSocket broadcast slot update failed')
            }

            try {
                const detail = await this.getBookingDetails(enriched.id)
                if (detail) {
                    await this.notifications_service.createNotification({
                        user_id: detail.parent_user_id,
                        type: 'consultation',
                        status: 'unread',
                        title: '📅 Booking Baru Dibuat',
                        body: `Booking Anda untuk ${labelConsultationType(payload.consultation_type)} di ${detail.posyandu_name} telah berhasil dibuat. Menunggu konfirmasi petugas.`,
                        data: {
                            consultation_id: enriched.id,
                            scheduled_at: created.scheduled_at.toISOString(),
                            queue_number: enriched.queue_number,
                            consultation_type: payload.consultation_type,
                            posyandu_name: detail.posyandu_name
                        }
                    })
                }
            } catch (err) {
                logger.error(err, 'Failed to send createBooking notification')
            }
        }

        return Array.isArray(payload.scheduled_at)
            ? enrichedBookings
            : enrichedBookings[0]
    }

    async getConsultations(filters: ConsultationsQueryFilters) {
        const result =
            await this.consultations_repository.getConsultations(filters)
        const enrichedData = await this.batchEnrichWithQueueNumbers(result.data)
        return {
            data: enrichedData,
            totalItems: result.totalItems
        }
    }

    async getConsultationById(
        public_id: string
    ): Promise<Consultation & { queue_number: number }> {
        const consultation =
            await this.consultations_repository.findById(public_id)
        if (!consultation) {
            throw ApiError.notFound('Consultation booking not found')
        }
        return this.enrichWithQueueNumber(consultation)
    }

    async verifyParentAccess(
        public_id: string,
        parent_id: string
    ): Promise<Consultation & { queue_number: number }> {
        const consultation = await this.getConsultationById(public_id)
        if (consultation.parent_id !== parent_id) {
            throw ApiError.forbidden(
                'Access denied. You do not own this consultation booking.'
            )
        }
        return consultation
    }

    private handleDatabaseUpdateError(error: unknown): never {
        const dbErr = error as { code?: string; constraint?: string }
        if (dbErr.code === '23505') {
            if (
                dbErr.constraint === 'consultations_parent_schedule_unique_idx'
            ) {
                throw ApiError.conflict(
                    'You already have another booking at the same time.'
                )
            }
            throw ApiError.conflict(
                'This schedule slot is already booked by another patient.'
            )
        }
        throw error
    }

    private async checkScheduledTimeAvailability(
        consultation: Consultation,
        scheduled_at: Date,
        public_id: string
    ): Promise<void> {
        this.validateScheduledAt(consultation.consultation_type, scheduled_at)
        
        const conditions = [
            eq(consultations.scheduled_at, scheduled_at),
            sql`${consultations.deleted_at} IS NULL`,
            ne(consultations.status, 'cancelled'),
            ne(consultations.id, public_id)
        ]

        if (consultation.midwife_id) {
            conditions.push(eq(consultations.midwife_id, consultation.midwife_id))
        } else {
            conditions.push(
                eq(consultations.posyandu_id, consultation.posyandu_id),
                eq(
                    consultations.consultation_type,
                    consultation.consultation_type
                )
            )
        }

        const existingBooking = await this.dbInstance
            .select()
            .from(consultations)
            .where(and(...conditions))
            .limit(1)

        if (existingBooking.length > 0) {
            throw ApiError.badRequest(
                'The selected timeslot is already booked and unavailable'
            )
        }
    }

    private broadcastWebSocketSlotUpdates(
        posyandu_id: string,
        type: string,
        dates: Date[]
    ): void {
        try {
            for (const d of dates) {
                const dateString = d.toISOString().split('T')[0]
                WsManager.broadcastSlotUpdate(posyandu_id, type, dateString)
            }
        } catch (err) {
            logger.error(err, 'WebSocket broadcast slot update failed')
        }
    }

    private async sendRescheduledNotifications(
        enriched: Consultation & { queue_number: number },
        oldType: string,
        oldScheduledAt: Date,
        newScheduledAt: Date
    ): Promise<void> {
        try {
            const detail = await this.getBookingDetails(enriched.id)
            if (!detail) return

            await EmailService.sendBookingRescheduled(detail.parent_email, {
                parentName: detail.parent_name,
                consultationType: oldType,
                oldScheduledAt: oldScheduledAt,
                newScheduledAt: newScheduledAt,
                posyanduName: detail.posyandu_name,
                queueNumber: enriched.queue_number
            })

            await this.notifications_service.createNotification({
                user_id: detail.parent_user_id,
                type: 'consultation',
                status: 'unread',
                title: '📅 Jadwal Konsultasi Diubah',
                body: `Jadwal konsultasi Anda di ${detail.posyandu_name} telah diubah menjadi ${formatDateId(newScheduledAt)}.`,
                data: {
                    consultation_id: enriched.id,
                    scheduled_at: newScheduledAt.toISOString(),
                    queue_number: enriched.queue_number,
                    consultation_type: oldType,
                    posyandu_name: detail.posyandu_name
                }
            })
        } catch (err) {
            logger.error(err, 'Failed to handle rescheduled notifications')
        }
    }

    async updateBooking(
        public_id: string,
        payload: {
            scheduled_at?: Date
            notes?: string | null
            pregnancy_record_id?: string | null
            children_id?: string | null
        }
    ): Promise<Consultation & { queue_number: number }> {
        const consultation = await this.getConsultationById(public_id)

        if (
            consultation.status === 'completed' ||
            consultation.status === 'cancelled'
        ) {
            throw ApiError.badRequest(
                'Cannot update a completed or cancelled consultation booking'
            )
        }

        const updatedData: Partial<NewConsultation> = {}
        const oldScheduledAt = new Date(consultation.scheduled_at)
        const oldPosyanduId = consultation.posyandu_id
        const oldType = consultation.consultation_type

        if (payload.scheduled_at) {
            await this.checkScheduledTimeAvailability(
                consultation,
                payload.scheduled_at,
                public_id
            )
            updatedData.scheduled_at = payload.scheduled_at
            if (consultation.status === 'confirmed') {
                updatedData.status = 'rescheduled'
            }
        }
        if (payload.notes !== undefined) updatedData.notes = payload.notes
        if (payload.pregnancy_record_id !== undefined)
            updatedData.pregnancy_record_id = payload.pregnancy_record_id
        if (payload.children_id !== undefined)
            updatedData.children_id = payload.children_id

        let result: Consultation | undefined
        try {
            result = await this.consultations_repository.update(
                public_id,
                updatedData
            )
        } catch (error: unknown) {
            this.handleDatabaseUpdateError(error)
        }

        if (!result) {
            throw ApiError.internal('Failed to update consultation booking')
        }
        const enriched = await this.enrichWithQueueNumber(result)

        await this.invalidateSlotsCache(oldPosyanduId, oldType, oldScheduledAt, consultation.midwife_id)
        if (payload.scheduled_at) {
            await this.invalidateSlotsCache(
                oldPosyanduId,
                oldType,
                payload.scheduled_at,
                consultation.midwife_id
            )
        }

        const datesToUpdate = [oldScheduledAt]
        if (payload.scheduled_at) {
            datesToUpdate.push(payload.scheduled_at)
        }
        this.broadcastWebSocketSlotUpdates(
            oldPosyanduId,
            oldType,
            datesToUpdate
        )

        if (payload.scheduled_at && consultation.status === 'confirmed') {
            await this.sendRescheduledNotifications(
                enriched,
                oldType,
                oldScheduledAt,
                payload.scheduled_at
            )
        }

        return enriched
    }

    private validateStatusTransitionActor(
        consultation: Consultation,
        actor: { role: string; parent_id?: string },
        targetStatus: string
    ): void {
        if (actor.role === 'parent') {
            if (consultation.parent_id !== actor.parent_id) {
                throw ApiError.forbidden(
                    'Access denied. You do not own this booking.'
                )
            }
            if (targetStatus !== 'cancelled') {
                throw ApiError.forbidden(
                    'Parents can only update status to cancelled'
                )
            }
        }
    }

    private handleConfirmedStatus(
        actor: { role: string; midwife_id?: string; cadre_id?: string },
        updatedData: Partial<NewConsultation>
    ): void {
        if (actor.role === 'midwife' && actor.midwife_id) {
            updatedData.midwife_id = actor.midwife_id
            updatedData.cadre_id = null
        } else if (actor.role === 'cadre' && actor.cadre_id) {
            updatedData.cadre_id = actor.cadre_id
            updatedData.midwife_id = null
        }
    }

    private handleCancelledStatus(
        cancellation_reason: string | null | undefined,
        updatedData: Partial<NewConsultation>
    ): void {
        if (!cancellation_reason) {
            throw ApiError.badRequest('Cancellation reason is required')
        }
        updatedData.cancellation_reason = cancellation_reason
    }

    private handleCompletedStatus(
        payload: {
            duration_minutes?: number | null
            follow_up_required?: boolean
            follow_up_date?: Date | null
        },
        updatedData: Partial<NewConsultation>
    ): void {
        updatedData.actual_start_at = new Date()
        if (payload.duration_minutes) {
            updatedData.duration_minutes = payload.duration_minutes
        }
        if (payload.follow_up_required !== undefined) {
            updatedData.follow_up_required = payload.follow_up_required
        }
        if (payload.follow_up_date !== undefined) {
            updatedData.follow_up_date = payload.follow_up_date
        }
    }

    private prepareStatusUpdateFields(
        actor: { role: string; midwife_id?: string; cadre_id?: string },
        payload: {
            status:
                | 'pending'
                | 'confirmed'
                | 'completed'
                | 'cancelled'
                | 'rescheduled'
            cancellation_reason?: string | null
            notes?: string | null
            duration_minutes?: number | null
            follow_up_required?: boolean
            follow_up_date?: Date | null
        }
    ): Partial<NewConsultation> {
        const updatedData: Partial<NewConsultation> = {
            status: payload.status
        }

        if (payload.status === 'confirmed') {
            this.handleConfirmedStatus(actor, updatedData)
        } else if (payload.status === 'cancelled') {
            this.handleCancelledStatus(payload.cancellation_reason, updatedData)
        } else if (payload.status === 'completed') {
            this.handleCompletedStatus(payload, updatedData)
        }

        if (payload.notes !== undefined) {
            updatedData.notes = payload.notes
        }

        return updatedData
    }

    async updateBookingStatus(
        public_id: string,
        actor: {
            role: string
            midwife_id?: string
            cadre_id?: string
            parent_id?: string
        },
        payload: {
            status:
                | 'pending'
                | 'confirmed'
                | 'completed'
                | 'cancelled'
                | 'rescheduled'
            cancellation_reason?: string | null
            notes?: string | null
            duration_minutes?: number | null
            follow_up_required?: boolean
            follow_up_date?: Date | null
        }
    ): Promise<Consultation & { queue_number: number }> {
        const consultation = await this.getConsultationById(public_id)

        this.validateStatusTransitionActor(consultation, actor, payload.status)

        const updatedData = this.prepareStatusUpdateFields(actor, payload)

        const result = await this.consultations_repository.update(
            public_id,
            updatedData
        )
        if (!result) {
            throw ApiError.internal('Failed to update consultation status')
        }
        const enriched = await this.enrichWithQueueNumber(result)

        await this.invalidateSlotsCache(
            consultation.posyandu_id,
            consultation.consultation_type,
            consultation.scheduled_at,
            consultation.midwife_id
        )

        try {
            const dateString = new Date(consultation.scheduled_at)
                .toISOString()
                .split('T')[0]
            WsManager.broadcastSlotUpdate(
                consultation.posyandu_id,
                consultation.consultation_type,
                dateString
            )
        } catch (err) {
            logger.error(err, 'WebSocket broadcast slot update failed')
        }

        try {
            const detail = await this.getBookingDetails(enriched.id)
            if (detail) {
                const typeLabel = labelConsultationType(
                    consultation.consultation_type
                )
                const dateStr = formatDateId(consultation.scheduled_at)

                if (payload.status === 'confirmed') {
                    const officerName = await this.getOfficerName(actor)
                    await EmailService.sendBookingConfirmation(
                        detail.parent_email,
                        {
                            parentName: detail.parent_name,
                            consultationType: consultation.consultation_type,
                            scheduledAt: consultation.scheduled_at,
                            posyanduName: detail.posyandu_name,
                            queueNumber: enriched.queue_number,
                            officerName
                        }
                    )

                    await this.notifications_service.createNotification({
                        user_id: detail.parent_user_id,
                        type: 'consultation',
                        status: 'unread',
                        title: '✅ Booking Dikonfirmasi',
                        body: `Booking konsultasi Anda untuk ${typeLabel} pada ${dateStr} telah dikonfirmasi oleh petugas. Nomor antrean: #${enriched.queue_number}`,
                        data: {
                            consultation_id: enriched.id,
                            scheduled_at:
                                consultation.scheduled_at.toISOString(),
                            queue_number: enriched.queue_number,
                            consultation_type: consultation.consultation_type,
                            posyandu_name: detail.posyandu_name
                        }
                    })
                } else if (payload.status === 'cancelled') {
                    const cancelledBy =
                        actor.role === 'parent' ? 'parent' : 'officer'
                    await EmailService.sendBookingCancellation(
                        detail.parent_email,
                        {
                            parentName: detail.parent_name,
                            consultationType: consultation.consultation_type,
                            scheduledAt: consultation.scheduled_at,
                            posyanduName: detail.posyandu_name,
                            cancellationReason:
                                payload.cancellation_reason ||
                                'Dibatalkan oleh petugas',
                            cancelledBy
                        }
                    )

                    await this.notifications_service.createNotification({
                        user_id: detail.parent_user_id,
                        type: 'consultation',
                        status: 'unread',
                        title: '❌ Booking Dibatalkan',
                        body: `Booking konsultasi Anda untuk ${typeLabel} pada ${dateStr} dibatalkan. Alasan: ${payload.cancellation_reason || 'Dibatalkan oleh petugas'}.`,
                        data: {
                            consultation_id: enriched.id,
                            scheduled_at:
                                consultation.scheduled_at.toISOString(),
                            queue_number: enriched.queue_number,
                            consultation_type: consultation.consultation_type,
                            posyandu_name: detail.posyandu_name
                        }
                    })
                } else if (payload.status === 'completed') {
                    const officerName = await this.getOfficerName(actor)
                    await EmailService.sendBookingCompleted(
                        detail.parent_email,
                        {
                            parentName: detail.parent_name,
                            consultationType: consultation.consultation_type,
                            posyanduName: detail.posyandu_name,
                            durationMinutes:
                                payload.duration_minutes || undefined,
                            followUpRequired: payload.follow_up_required,
                            followUpDate: payload.follow_up_date,
                            officerName
                        }
                    )

                    await this.notifications_service.createNotification({
                        user_id: detail.parent_user_id,
                        type: 'consultation',
                        status: 'unread',
                        title: '✨ Konsultasi Selesai',
                        body: `Konsultasi Anda telah selesai dilakukan. Terima kasih atas kunjungan Anda!`,
                        data: {
                            consultation_id: enriched.id,
                            scheduled_at:
                                consultation.scheduled_at.toISOString(),
                            queue_number: enriched.queue_number,
                            consultation_type: consultation.consultation_type,
                            posyandu_name: detail.posyandu_name
                        }
                    })
                }
            }
        } catch (err) {
            logger.error(
                err,
                'Failed to handle booking status update notifications'
            )
        }

        return enriched
    }

    async deleteBooking(
        public_id: string,
        is_permanent = false
    ): Promise<Consultation & { queue_number: number }> {
        const consultation = await this.getConsultationById(public_id)
        let result: Consultation | undefined
        if (is_permanent) {
            result = await this.consultations_repository.hardDelete(public_id)
        } else {
            result = await this.consultations_repository.softDelete(public_id)
        }
        if (!result) {
            throw ApiError.internal('Failed to delete consultation booking')
        }
        const enriched = await this.enrichWithQueueNumber(result)

        await this.invalidateSlotsCache(
            consultation.posyandu_id,
            consultation.consultation_type,
            consultation.scheduled_at,
            consultation.midwife_id
        )

        try {
            const dateString = new Date(consultation.scheduled_at)
                .toISOString()
                .split('T')[0]
            WsManager.broadcastSlotUpdate(
                consultation.posyandu_id,
                consultation.consultation_type,
                dateString
            )
        } catch (err) {
            logger.error(err, 'WebSocket broadcast slot update failed')
        }

        return enriched
    }

    async restoreBooking(
        public_id: string
    ): Promise<Consultation & { queue_number: number }> {
        const [consultation] = await this.dbInstance
            .select()
            .from(consultations)
            .where(eq(consultations.id, public_id))
            .limit(1)

        if (!consultation) {
            throw ApiError.notFound('Consultation booking not found')
        }

        const result = await this.consultations_repository.restore(public_id)
        if (!result) {
            throw ApiError.internal('Failed to restore consultation booking')
        }
        const enriched = await this.enrichWithQueueNumber(result)

        await this.invalidateSlotsCache(
            consultation.posyandu_id,
            consultation.consultation_type,
            consultation.scheduled_at,
            consultation.midwife_id
        )

        try {
            const dateString = new Date(consultation.scheduled_at)
                .toISOString()
                .split('T')[0]
            WsManager.broadcastSlotUpdate(
                consultation.posyandu_id,
                consultation.consultation_type,
                dateString
            )
        } catch (err) {
            logger.error(err, 'WebSocket broadcast slot update failed')
        }

        return enriched
    }
}
