import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewVitaminRecord, VitaminRecord } from '@/db'
import {
    VitaminRecordRepository,
    VitaminRecordQueryFilters
} from '@/repositories/vitamin-records-repository'
import { AuthorizationService } from '@/services/authorization-service'
import type { AuthenticatedUser } from '@/services/auth-service'

export class VitaminRecordService {
    constructor(
        private readonly vitamin_record_repository: VitaminRecordRepository,
        private readonly authorization_service: AuthorizationService = new AuthorizationService()
    ) {}

    async createVitaminRecord(
        record_payload: NewVitaminRecord,
        currentUser: AuthenticatedUser
    ): Promise<VitaminRecord> {
        this.assertCanWrite(currentUser)
        const posyanduId = await this.authorization_service.getChildPosyanduId(
            record_payload.children_id
        )

        const isDuplicate =
            await this.vitamin_record_repository.existsByUniqueKey(
                record_payload.children_id,
                record_payload.distribution_period,
                record_payload.distribution_year
            )
        if (isDuplicate) {
            throw ApiError.conflict(
                'Vitamin record for this child, period, and year already exists'
            )
        }

        return this.vitamin_record_repository.create({
            ...record_payload,
            posyandu_id: posyanduId,
            ...(currentUser.role === 'cadre'
                ? {
                      cadre_id:
                          this.authorization_service.getAssignmentId(
                              currentUser,
                              posyanduId
                          ) ?? null,
                      midwife_id: null
                  }
                : currentUser.role === 'midwife'
                  ? {
                        cadre_id: null,
                        midwife_id:
                            this.authorization_service.getAssignmentId(
                                currentUser,
                                posyanduId
                            ) ?? null
                    }
                  : {})
        })
    }

    async getVitaminRecords(
        query_filters: VitaminRecordQueryFilters | undefined,
        currentUser: AuthenticatedUser
    ) {
        const { page = 1, limit = 10 } = query_filters || {}
        const filters = { ...query_filters }
        if (currentUser.role === 'parent') {
            filters.parent_user_id = currentUser.id
        }

        const { data, totalItems } =
            await this.vitamin_record_repository.getVitaminRecords(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getVitaminRecordById(
        public_id: string,
        currentUser: AuthenticatedUser,
        includeDeleted = false
    ): Promise<VitaminRecord> {
        const record = await this.vitamin_record_repository.findById(
            public_id,
            includeDeleted
        )
        if (!record) throw ApiError.notFound('Vitamin record not found')
        if (currentUser.role === 'parent') {
            await this.authorization_service.requireChildAccess(
                currentUser,
                record.children_id
            )
        }
        return record
    }

    async updateVitaminRecord(
        public_id: string,
        record_payload: Partial<NewVitaminRecord>,
        currentUser: AuthenticatedUser
    ): Promise<VitaminRecord> {
        this.assertCanWrite(currentUser)
        const existing = await this.getVitaminRecordById(public_id, currentUser)
        const childrenId = record_payload.children_id ?? existing.children_id
        const posyanduId =
            await this.authorization_service.getChildPosyanduId(childrenId)

        const period =
            record_payload.distribution_period ?? existing.distribution_period
        const year =
            record_payload.distribution_year ?? existing.distribution_year
        if (
            childrenId !== existing.children_id ||
            period !== existing.distribution_period ||
            year !== existing.distribution_year
        ) {
            const isDuplicate =
                await this.vitamin_record_repository.existsByUniqueKey(
                    childrenId,
                    period,
                    year
                )
            if (isDuplicate) {
                throw ApiError.conflict(
                    'Vitamin record with the same child, period, and year already exists'
                )
            }
        }

        const scopedPayload: Partial<NewVitaminRecord> = {
            ...record_payload,
            posyandu_id: posyanduId
        }
        if (currentUser.role === 'cadre') {
            scopedPayload.cadre_id =
                this.authorization_service.getAssignmentId(
                    currentUser,
                    posyanduId
                ) ?? null
            scopedPayload.midwife_id = null
        } else if (currentUser.role === 'midwife') {
            scopedPayload.cadre_id = null
            scopedPayload.midwife_id =
                this.authorization_service.getAssignmentId(
                    currentUser,
                    posyanduId
                ) ?? null
        } else {
            delete scopedPayload.cadre_id
            delete scopedPayload.midwife_id
        }

        const updated = await this.vitamin_record_repository.update(
            public_id,
            scopedPayload
        )
        if (!updated)
            throw ApiError.badRequest('Failed to update vitamin record')
        return updated
    }

    async deleteVitaminRecord(
        public_id: string,
        is_permanent: boolean,
        currentUser: AuthenticatedUser
    ): Promise<VitaminRecord> {
        this.assertCanWrite(currentUser)
        await this.getVitaminRecordById(public_id, currentUser)

        const deleted = is_permanent
            ? await this.vitamin_record_repository.hardDelete(public_id)
            : await this.vitamin_record_repository.softDelete(public_id)

        if (!deleted)
            throw ApiError.badRequest('Failed to delete vitamin record')
        return deleted
    }

    async restoreVitaminRecord(
        public_id: string,
        currentUser: AuthenticatedUser
    ): Promise<VitaminRecord> {
        this.assertCanWrite(currentUser)
        await this.getVitaminRecordById(public_id, currentUser, true)
        const restored = await this.vitamin_record_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore vitamin record')
        return restored
    }

    private assertCanWrite(currentUser: AuthenticatedUser): void {
        if (currentUser.role === 'parent') {
            throw ApiError.forbidden('Parents cannot modify vitamin records')
        }
    }
}
