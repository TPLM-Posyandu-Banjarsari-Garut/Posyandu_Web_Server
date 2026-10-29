import { createPaginationMeta } from '@/utils/pagination'
import {
    NewExaminationRecord,
    ExaminationRecord,
    cadres,
    childrens,
    midwifes,
    parents,
    pregnancyRecords,
    relationChildrens
} from '@/db'
import {
    ExaminationRecordsRepository,
    ExaminationRecordsQueryFilters
} from '@/repositories/examination-records-repository'
import { ExaminationSchedulesRepository } from '@/repositories/examination-schedules-repository'
import { ApiError } from '@/utils/api-error'
import { AuthorizationService } from '@/services/authorization-service'
import type { AuthenticatedUser } from '@/services/auth-service'
import db from '@/configs/db'
import { and, eq, sql } from 'drizzle-orm'

const ADMIN_ROLES = ['admin', 'posyandu_admin', 'village_admin'] as const

export class ExaminationRecordsService {
    private readonly authorization_service = new AuthorizationService()

    constructor(
        private readonly records_repository: ExaminationRecordsRepository,
        private readonly schedules_repository: ExaminationSchedulesRepository
    ) {}

    async createRecord(
        payload: NewExaminationRecord,
        currentUser: AuthenticatedUser
    ): Promise<ExaminationRecord> {
        this.assertCanWrite(currentUser)
        this.authorization_service.requireAssignedPosyandu(
            currentUser,
            payload.posyandu_id
        )

        if (payload.children_id) {
            const childPosyanduId =
                await this.authorization_service.requireChildAccess(
                    currentUser,
                    payload.children_id
                )
            if (childPosyanduId !== payload.posyandu_id) {
                throw ApiError.forbidden(
                    'The child must belong to the examination Posyandu'
                )
            }

            if (payload.parent_id) {
                const [relationship] = await db
                    .select({ id: relationChildrens.id })
                    .from(relationChildrens)
                    .where(
                        and(
                            eq(relationChildrens.children_id, payload.children_id),
                            eq(relationChildrens.parent_id, payload.parent_id),
                            eq(relationChildrens.is_deleted, false),
                            sql`${relationChildrens.deleted_at} IS NULL`
                        )
                    )
                    .limit(1)
                if (!relationship) {
                    throw ApiError.forbidden(
                        'The parent is not associated with this child'
                    )
                }
            }
        }

        if (payload.parent_id) {
            const [activeParent] = await db
                .select({ id: parents.id })
                .from(parents)
                .where(
                    and(
                        eq(parents.id, payload.parent_id),
                        eq(parents.status, 'active'),
                        eq(parents.is_deleted, false)
                    )
                )
                .limit(1)
            if (!activeParent) {
                throw ApiError.notFound('Active parent profile not found')
            }

            if (!payload.children_id) {
                const [childAtPosyandu] = await db
                    .select({ id: relationChildrens.id })
                    .from(relationChildrens)
                    .innerJoin(
                        childrens,
                        eq(relationChildrens.children_id, childrens.id)
                    )
                    .where(
                        and(
                            eq(relationChildrens.parent_id, payload.parent_id),
                            eq(childrens.posyandu_id, payload.posyandu_id),
                            eq(relationChildrens.is_deleted, false),
                            sql`${relationChildrens.deleted_at} IS NULL`,
                            sql`${childrens.deleted_at} IS NULL`
                        )
                    )
                    .limit(1)
                const [pregnancyAtPosyandu] = await db
                    .select({ id: pregnancyRecords.id })
                    .from(pregnancyRecords)
                    .where(
                        and(
                            eq(pregnancyRecords.parent_id, payload.parent_id),
                            eq(pregnancyRecords.posyandu_id, payload.posyandu_id),
                            sql`${pregnancyRecords.deleted_at} IS NULL`
                        )
                    )
                    .limit(1)

                if (!childAtPosyandu && !pregnancyAtPosyandu) {
                    throw ApiError.forbidden(
                        'The parent is not associated with this Posyandu'
                    )
                }
            }
        }

        const examDate = new Date(payload.examination_date)
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
            examDate.getTime() < startOfToday.getTime() ||
            examDate.getTime() > endOfLusa.getTime()
        ) {
            throw ApiError.badRequest(
                'Booking is only allowed for today, tomorrow, and the day after tomorrow'
            )
        }

        if (payload.schedule_id) {
            const schedule = await this.schedules_repository.findById(
                payload.schedule_id
            )
            if (!schedule) {
                throw ApiError.notFound(
                    'Associated examination schedule not found'
                )
            }
            if (
                schedule.status === 'cancelled' ||
                schedule.posyandu_id !== payload.posyandu_id ||
                schedule.examination_id !== payload.examination_id
            ) {
                throw ApiError.badRequest(
                    'The examination schedule does not match this record'
                )
            }
            const existing = await this.records_repository.getRecords({
                schedule_id: payload.schedule_id,
                children_id: payload.children_id || undefined,
                parent_id: payload.parent_id || undefined,
                limit: 1
            })
            if (existing.data.length > 0) {
                throw ApiError.badRequest(
                    'You or your child has already registered for this examination schedule'
                )
            }

            if (
                schedule.max_participants &&
                schedule.current_participants >= schedule.max_participants
            ) {
                throw ApiError.badRequest(
                    'The selected examination schedule is already full'
                )
            }
        }

        const assignmentId = currentUser.posyandu_assignments?.find(
            assignment => assignment.posyandu_id === payload.posyandu_id
        )?.id
        const effectiveCadreId =
            currentUser.role === 'cadre' ? assignmentId : payload.cadre_id
        const effectiveMidwifeId =
            currentUser.role === 'midwife' ? assignmentId : payload.midwife_id

        if (!effectiveCadreId || !effectiveMidwifeId) {
            throw ApiError.forbidden(
                'An active staff assignment is required for this Posyandu'
            )
        }

        const [cadre] = await db
            .select({ id: cadres.id })
            .from(cadres)
            .where(
                and(
                    eq(cadres.id, effectiveCadreId),
                    eq(cadres.posyandu_id, payload.posyandu_id),
                    eq(cadres.status, 'active'),
                    eq(cadres.is_deleted, false)
                )
            )
            .limit(1)
        const [midwife] = await db
            .select({ id: midwifes.id })
            .from(midwifes)
            .where(
                and(
                    eq(midwifes.id, effectiveMidwifeId),
                    eq(midwifes.posyandu_id, payload.posyandu_id),
                    eq(midwifes.status, 'active'),
                    eq(midwifes.is_deleted, false)
                )
            )
            .limit(1)
        if (!cadre || !midwife) {
            throw ApiError.forbidden(
                'The selected staff must have an active assignment to this Posyandu'
            )
        }

        const safePayload: NewExaminationRecord = {
            ...payload,
            cadre_id: effectiveCadreId,
            midwife_id: effectiveMidwifeId
        }
        if (currentUser.role === 'cadre') {
            safePayload.medically_validated_at = null
            safePayload.medically_validated_by_midwife_id = null
        } else if (currentUser.role === 'midwife') {
            const isValidating =
                payload.medically_validated_at != null ||
                payload.medically_validated_by_midwife_id != null
            safePayload.medically_validated_at = isValidating ? new Date() : null
            safePayload.medically_validated_by_midwife_id = isValidating
                ? effectiveMidwifeId
                : null
        }

        const created = await this.records_repository.create(safePayload)
        if (created.schedule_id) {
            await this.schedules_repository.incrementParticipants(
                created.schedule_id
            )
        }
        return created
    }

    async getRecords(
        filters: ExaminationRecordsQueryFilters | undefined,
        currentUser: AuthenticatedUser
    ) {
        const scopedFilters = { ...filters }
        if (currentUser.role === 'parent') {
            scopedFilters.parent_id = currentUser.parent_id ?? ''
        } else if (
            currentUser.role === 'cadre' ||
            currentUser.role === 'midwife'
        ) {
            scopedFilters.posyandu_ids = currentUser.posyandu_ids ?? []
        }

        const { page = 1, limit = 10 } = scopedFilters
        const { data, totalItems } =
            await this.records_repository.getRecords(scopedFilters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getRecordById(
        id: string,
        currentUser: AuthenticatedUser,
        includeDeleted = false
    ): Promise<ExaminationRecord> {
        const record = await this.records_repository.findById(id, includeDeleted)
        if (!record) throw ApiError.notFound('Examination record not found')
        await this.assertCanAccessRecord(record, currentUser)
        return record
    }

    async updateRecord(
        id: string,
        payload: Partial<NewExaminationRecord>,
        currentUser: AuthenticatedUser
    ): Promise<ExaminationRecord> {
        this.assertCanWrite(currentUser)
        const existing = await this.getRecordById(id, currentUser)
        const safePayload = { ...payload }

        if (
            currentUser.role === 'cadre' ||
            currentUser.role === 'midwife'
        ) {
            delete safePayload.posyandu_id
            delete safePayload.children_id
            delete safePayload.parent_id
            delete safePayload.examination_id
            delete safePayload.schedule_id
            delete safePayload.cadre_id
            delete safePayload.midwife_id

            if (currentUser.role === 'cadre') {
                delete safePayload.medically_validated_at
                delete safePayload.medically_validated_by_midwife_id
            } else if (
                payload.medically_validated_by_midwife_id !== undefined ||
                payload.medically_validated_at !== undefined
            ) {
                const isValidating =
                    payload.medically_validated_by_midwife_id != null ||
                    payload.medically_validated_at != null
                if (!isValidating) {
                    safePayload.medically_validated_by_midwife_id = null
                    safePayload.medically_validated_at = null
                } else {
                    const midwifeId = currentUser.posyandu_assignments?.find(
                        assignment =>
                            assignment.posyandu_id === existing.posyandu_id
                    )?.id
                    if (!midwifeId) {
                        throw ApiError.forbidden(
                            'An active midwife assignment is required for this Posyandu'
                        )
                    }
                    safePayload.medically_validated_by_midwife_id = midwifeId
                    safePayload.medically_validated_at = new Date()
                }
            }
        }

        const updated = await this.records_repository.update(id, safePayload)
        if (!updated)
            throw ApiError.server('Failed to update examination record')
        return updated
    }

    async deleteRecord(
        id: string,
        isPermanent: boolean,
        currentUser: AuthenticatedUser
    ): Promise<ExaminationRecord> {
        this.assertCanWrite(currentUser)
        const record = await this.getRecordById(id, currentUser)
        if (isPermanent && !this.isAdmin(currentUser)) {
            throw ApiError.forbidden(
                'Only administrators can permanently delete examination records'
            )
        }
        const deleted = isPermanent
            ? await this.records_repository.hardDelete(id)
            : await this.records_repository.softDelete(id)

        if (!deleted)
            throw ApiError.server('Failed to delete examination record')

        if (record.schedule_id) {
            await this.schedules_repository.decrementParticipants(
                record.schedule_id
            )
        }

        return deleted
    }

    async restoreRecord(
        id: string,
        currentUser: AuthenticatedUser
    ): Promise<ExaminationRecord> {
        this.assertCanWrite(currentUser)
        const record = await this.getRecordById(id, currentUser, true)
        const restored = await this.records_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore examination record')

        if (record.schedule_id) {
            await this.schedules_repository.incrementParticipants(
                record.schedule_id
            )
        }

        return restored
    }

    private async assertCanAccessRecord(
        record: ExaminationRecord,
        currentUser: AuthenticatedUser
    ): Promise<void> {
        if (this.isAdmin(currentUser)) return

        if (
            currentUser.role === 'cadre' ||
            currentUser.role === 'midwife'
        ) {
            this.authorization_service.requireAssignedPosyandu(
                currentUser,
                record.posyandu_id
            )
            return
        }

        if (currentUser.role === 'parent') {
            if (
                record.parent_id &&
                record.parent_id === currentUser.parent_id
            ) {
                return
            }
            if (
                record.children_id &&
                (await this.authorization_service.canAccessChild(
                    currentUser,
                    record.children_id
                ))
            ) {
                return
            }
        }

        throw ApiError.forbidden(
            'You do not have permission to access this examination record'
        )
    }

    private assertCanWrite(currentUser: AuthenticatedUser): void {
        if (
            currentUser.role === 'parent' ||
            ![
                'admin',
                'posyandu_admin',
                'village_admin',
                'cadre',
                'midwife'
            ].includes(currentUser.role)
        ) {
            throw ApiError.forbidden(
                'You do not have permission to modify examination records'
            )
        }
    }

    private isAdmin(currentUser: AuthenticatedUser): boolean {
        return ADMIN_ROLES.includes(
            currentUser.role as (typeof ADMIN_ROLES)[number]
        )
    }
}
