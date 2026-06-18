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
import { and, eq } from 'drizzle-orm'
import db from '@/configs/db'

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

    async createBooking(
        parent_id: string,
        payload: {
            consultation_type: 'pregnancy' | 'child_development' | 'general'
            scheduled_at: Date
            pregnancy_record_id?: string | null
            children_id?: string | null
            notes?: string | null
            posyandu_id?: string | null
        }
    ): Promise<Consultation> {
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

        return this.consultations_repository.create(newBooking)
    }

    async getConsultations(filters: ConsultationsQueryFilters) {
        return this.consultations_repository.getConsultations(filters)
    }

    async getConsultationById(public_id: string): Promise<Consultation> {
        const consultation =
            await this.consultations_repository.findById(public_id)
        if (!consultation) {
            throw ApiError.notFound('Consultation booking not found')
        }
        return consultation
    }

    async verifyParentAccess(
        public_id: string,
        parent_id: string
    ): Promise<Consultation> {
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
    ): Promise<Consultation> {
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
        return result
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
    ): Promise<Consultation> {
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
        return result
    }

    async deleteBooking(
        public_id: string,
        is_permanent = false
    ): Promise<Consultation> {
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
        return result
    }

    async restoreBooking(public_id: string): Promise<Consultation> {
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
        return result
    }
}
