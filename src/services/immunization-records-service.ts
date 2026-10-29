import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewImmunizationRecord, ImmunizationRecord } from '@/db'
import {
    ImmunizationRecordRepository,
    ImmunizationRecordQueryFilters
} from '@/repositories/immunization-records-repository'
import { AuthorizationService } from '@/services/authorization-service'
import type { AuthenticatedUser } from '@/services/auth-service'

export class ImmunizationRecordService {
    constructor(
        private readonly immunization_record_repository: ImmunizationRecordRepository,
        private readonly authorization_service: AuthorizationService =
            new AuthorizationService()
    ) {}

    async createImmunizationRecord(
        record_payload: NewImmunizationRecord,
        currentUser: AuthenticatedUser
    ): Promise<ImmunizationRecord> {
        this.assertCanWrite(currentUser)
        const posyanduId = await this.authorization_service.getChildPosyanduId(
            record_payload.children_id
        )

        const isDuplicate =
            await this.immunization_record_repository.existsByUniqueKey(
                record_payload.children_id,
                record_payload.vaccine_id,
                record_payload.dose_number
            )
        if (isDuplicate) {
            throw ApiError.conflict(
                'Immunization record for this child, vaccine, and dose already exists'
            )
        }

        return this.immunization_record_repository.create({
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

    async getImmunizationRecords(
        query_filters: ImmunizationRecordQueryFilters | undefined,
        currentUser: AuthenticatedUser
    ) {
        const { page = 1, limit = 10 } = query_filters || {}
        const filters = { ...query_filters }
        if (currentUser.role === 'parent') {
            filters.parent_user_id = currentUser.id
        }

        const { data, totalItems } =
            await this.immunization_record_repository.getImmunizationRecords(
                filters
            )

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getImmunizationRecordById(
        public_id: string,
        currentUser: AuthenticatedUser,
        includeDeleted = false
    ): Promise<ImmunizationRecord> {
        const record = await this.immunization_record_repository.findById(
            public_id,
            includeDeleted
        )
        if (!record) throw ApiError.notFound('Immunization record not found')
        if (currentUser.role === 'parent') {
            const isOwned =
                await this.immunization_record_repository.isChildAssociatedWithParentUser(
                    currentUser.id,
                    record.children_id
                )
            if (!isOwned) {
                throw ApiError.notFound('Immunization record not found')
            }
        }
        return record
    }

    async updateImmunizationRecord(
        public_id: string,
        record_payload: Partial<NewImmunizationRecord>,
        currentUser: AuthenticatedUser
    ): Promise<ImmunizationRecord> {
        this.assertCanWrite(currentUser)
        const existing = await this.getImmunizationRecordById(
            public_id,
            currentUser
        )
        const childrenId = record_payload.children_id ?? existing.children_id
        const posyanduId = await this.authorization_service.getChildPosyanduId(
            childrenId
        )

        const vaccineId = record_payload.vaccine_id ?? existing.vaccine_id
        const doseNumber =
            record_payload.dose_number ?? existing.dose_number
        if (
            childrenId !== existing.children_id ||
            vaccineId !== existing.vaccine_id ||
            doseNumber !== existing.dose_number
        ) {
            const isDuplicate =
                await this.immunization_record_repository.existsByUniqueKey(
                    childrenId,
                    vaccineId,
                    doseNumber
                )
            if (isDuplicate) {
                throw ApiError.conflict(
                    'Immunization record with the same child, vaccine, and dose already exists'
                )
            }
        }

        const scopedPayload: Partial<NewImmunizationRecord> = {
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

        const updated = await this.immunization_record_repository.update(
            public_id,
            scopedPayload
        )
        if (!updated)
            throw ApiError.badRequest('Failed to update immunization record')
        return updated
    }

    async deleteImmunizationRecord(
        public_id: string,
        is_permanent: boolean,
        currentUser: AuthenticatedUser
    ): Promise<ImmunizationRecord> {
        this.assertCanWrite(currentUser)
        await this.getImmunizationRecordById(public_id, currentUser)

        const deleted = is_permanent
            ? await this.immunization_record_repository.hardDelete(public_id)
            : await this.immunization_record_repository.softDelete(public_id)

        if (!deleted)
            throw ApiError.badRequest('Failed to delete immunization record')
        return deleted
    }

    async restoreImmunizationRecord(
        public_id: string,
        currentUser: AuthenticatedUser
    ): Promise<ImmunizationRecord> {
        this.assertCanWrite(currentUser)
        await this.getImmunizationRecordById(public_id, currentUser, true)
        const restored =
            await this.immunization_record_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore immunization record')
        return restored
    }

    private assertCanWrite(currentUser: AuthenticatedUser): void {
        if (currentUser.role === 'parent') {
            throw ApiError.forbidden(
                'Parents cannot modify immunization records'
            )
        }
    }
}
