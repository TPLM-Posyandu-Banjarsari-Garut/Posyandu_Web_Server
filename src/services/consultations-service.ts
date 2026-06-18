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
    consultations
} from '@/db'
import { ApiError } from '@/utils/api-error'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { and, eq, ne, gte, lte, sql } from 'drizzle-orm'
import db from '@/configs/db'
import {
    GENERAL_CONSULTATION_SLOTS,
    EXAMINATION_SLOTS
} from '@/constants/booking-schedules'

type ConsultationType = 'pregnancy' | 'child_development' | 'general'

export class ConsultationsService {
    constructor(
        private readonly consultations_repository: ConsultationsRepository,
        private readonly dbInstance: NodePgDatabase = db
    ) {}

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

    private async enrichWithQueueNumber(
        consultation: Consultation
    ): Promise<Consultation & { queue_number: number }> {
        const targetDate = new Date(consultation.scheduled_at)
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

        const [result] = await this.dbInstance
            .select({ count: sql<number>`count(*)` })
            .from(consultations)
            .where(
                and(
                    eq(consultations.posyandu_id, consultation.posyandu_id),
                    eq(
                        consultations.consultation_type,
                        consultation.consultation_type
                    ),
                    gte(consultations.scheduled_at, startOfDay),
                    lte(consultations.scheduled_at, endOfDay),
                    sql`${consultations.deleted_at} IS NULL`,
                    ne(consultations.status, 'cancelled'),
                    lte(consultations.created_at, consultation.created_at)
                )
            )

        return {
            ...consultation,
            queue_number: Number(result?.count || 1)
        }
    }

    private validateScheduledAt(
        consultation_type: ConsultationType,
        scheduled_at: Date
    ): void {
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
        dateString: string
    ): Promise<{ time: string; available: boolean }[]> {
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

        const activeBookings = await this.dbInstance
            .select({ scheduled_at: consultations.scheduled_at })
            .from(consultations)
            .where(
                and(
                    eq(consultations.posyandu_id, posyandu_id),
                    eq(consultations.consultation_type, consultation_type),
                    gte(consultations.scheduled_at, startOfDay),
                    lte(consultations.scheduled_at, endOfDay),
                    sql`${consultations.deleted_at} IS NULL`,
                    ne(consultations.status, 'cancelled')
                )
            )

        const timeslots =
            consultation_type === 'general'
                ? GENERAL_CONSULTATION_SLOTS
                : EXAMINATION_SLOTS

        const now = new Date()

        return timeslots.map(timeStr => {
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
    }

    async createBooking(
        parent_id: string,
        payload: {
            consultation_type: ConsultationType
            scheduled_at: Date
            pregnancy_record_id?: string | null
            children_id?: string | null
            notes?: string | null
            posyandu_id?: string | null
        }
    ): Promise<Consultation & { queue_number: number }> {
        this.validateScheduledAt(
            payload.consultation_type,
            payload.scheduled_at
        )
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

        const existingBooking = await this.dbInstance
            .select()
            .from(consultations)
            .where(
                and(
                    eq(consultations.posyandu_id, derivedPosyanduId),
                    eq(
                        consultations.consultation_type,
                        payload.consultation_type
                    ),
                    eq(consultations.scheduled_at, payload.scheduled_at),
                    sql`${consultations.deleted_at} IS NULL`,
                    ne(consultations.status, 'cancelled')
                )
            )
            .limit(1)

        if (existingBooking.length > 0) {
            throw ApiError.badRequest(
                'The selected timeslot is already booked and unavailable'
            )
        }

        const newBooking: NewConsultation = {
            parent_id,
            posyandu_id: derivedPosyanduId,
            consultation_type: payload.consultation_type,
            scheduled_at: payload.scheduled_at,
            pregnancy_record_id: payload.pregnancy_record_id || null,
            children_id: payload.children_id || null,
            notes: payload.notes || null,
            status: 'pending'
        }

        const created = await this.consultations_repository.create(newBooking)
        return this.enrichWithQueueNumber(created)
    }

    async getConsultations(filters: ConsultationsQueryFilters) {
        const result =
            await this.consultations_repository.getConsultations(filters)
        const enrichedData = await Promise.all(
            result.data.map(item => this.enrichWithQueueNumber(item))
        )
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
        if (payload.scheduled_at) {
            this.validateScheduledAt(
                consultation.consultation_type,
                payload.scheduled_at
            )
            const existingBooking = await this.dbInstance
                .select()
                .from(consultations)
                .where(
                    and(
                        eq(consultations.posyandu_id, consultation.posyandu_id),
                        eq(
                            consultations.consultation_type,
                            consultation.consultation_type
                        ),
                        eq(consultations.scheduled_at, payload.scheduled_at),
                        sql`${consultations.deleted_at} IS NULL`,
                        ne(consultations.status, 'cancelled')
                    )
                )
                .limit(1)

            if (existingBooking.length > 0) {
                throw ApiError.badRequest(
                    'The selected timeslot is already booked and unavailable'
                )
            }

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

        const result = await this.consultations_repository.update(
            public_id,
            updatedData
        )
        if (!result) {
            throw ApiError.internal('Failed to update consultation booking')
        }
        return this.enrichWithQueueNumber(result)
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
        return this.enrichWithQueueNumber(result)
    }

    async deleteBooking(
        public_id: string,
        is_permanent = false
    ): Promise<Consultation & { queue_number: number }> {
        await this.getConsultationById(public_id)
        let result: Consultation | undefined
        if (is_permanent) {
            result = await this.consultations_repository.hardDelete(public_id)
        } else {
            result = await this.consultations_repository.softDelete(public_id)
        }
        if (!result) {
            throw ApiError.internal('Failed to delete consultation booking')
        }
        return this.enrichWithQueueNumber(result)
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
        return this.enrichWithQueueNumber(result)
    }
}
