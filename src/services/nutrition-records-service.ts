import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewNutritionRecord, NutritionRecord } from '@/db'
import {
    NutritionRecordRepository,
    NutritionRecordQueryFilters
} from '@/repositories/nutrition-records-repository'
import { AuthorizationService } from '@/services/authorization-service'
import type { AuthenticatedUser } from '@/services/auth-service'

export class NutritionRecordService {
    constructor(
        private readonly nutrition_record_repository: NutritionRecordRepository,
        private readonly authorization_service: AuthorizationService =
            new AuthorizationService()
    ) {}

    async createNutritionRecord(
        record_payload: NewNutritionRecord,
        currentUser: AuthenticatedUser
    ): Promise<NutritionRecord> {
        this.assertCanWrite(currentUser)
        const posyanduId = await this.authorization_service.getChildPosyanduId(
            record_payload.children_id
        )

        return this.nutrition_record_repository.create({
            ...record_payload,
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

    async getNutritionRecords(
        query_filters: NutritionRecordQueryFilters | undefined,
        currentUser: AuthenticatedUser
    ) {
        const { page = 1, limit = 10 } = query_filters || {}
        const filters = { ...query_filters }

        if (currentUser.role === 'parent') {
            filters.parent_id = currentUser.parent_id ?? ''
        } else if (
            currentUser.role === 'cadre' ||
            currentUser.role === 'midwife'
        ) {
            if (currentUser.posyandu_id) {
                filters.posyandu_id = currentUser.posyandu_id
            }
        }

        const { data, totalItems } =
            await this.nutrition_record_repository.getNutritionRecords(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getNutritionRecordById(
        public_id: string,
        currentUser: AuthenticatedUser,
        includeDeleted = false
    ): Promise<NutritionRecord> {
        const record = await this.nutrition_record_repository.findById(
            public_id,
            includeDeleted
        )
        if (!record) throw ApiError.notFound('Nutrition record not found')
        if (currentUser.role === 'parent') {
            await this.authorization_service.requireChildAccess(
                currentUser,
                record.children_id
            )
        }
        return record
    }

    async updateNutritionRecord(
        public_id: string,
        record_payload: Partial<NewNutritionRecord>,
        currentUser: AuthenticatedUser
    ): Promise<NutritionRecord> {
        this.assertCanWrite(currentUser)
        const existing = await this.getNutritionRecordById(
            public_id,
            currentUser
        )
        const childId = record_payload.children_id ?? existing.children_id
        const posyanduId = await this.authorization_service.getChildPosyanduId(
            childId
        )

        const scopedPayload: Partial<NewNutritionRecord> = {
            ...record_payload
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
        const updated = await this.nutrition_record_repository.update(
            public_id,
            scopedPayload
        )
        if (!updated)
            throw ApiError.badRequest('Failed to update nutrition record')
        return updated
    }

    async deleteNutritionRecord(
        public_id: string,
        is_permanent: boolean,
        currentUser: AuthenticatedUser
    ): Promise<NutritionRecord> {
        this.assertCanWrite(currentUser)
        await this.getNutritionRecordById(public_id, currentUser)

        const deleted = is_permanent
            ? await this.nutrition_record_repository.hardDelete(public_id)
            : await this.nutrition_record_repository.softDelete(public_id)

        if (!deleted)
            throw ApiError.badRequest('Failed to delete nutrition record')
        return deleted
    }

    async restoreNutritionRecord(
        public_id: string,
        currentUser: AuthenticatedUser
    ): Promise<NutritionRecord> {
        this.assertCanWrite(currentUser)
        await this.getNutritionRecordById(public_id, currentUser, true)
        const restored =
            await this.nutrition_record_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore nutrition record')
        return restored
    }

    private assertCanWrite(currentUser: AuthenticatedUser): void {
        if (currentUser.role === 'parent') {
            throw ApiError.forbidden(
                'Parents cannot modify nutrition records'
            )
        }
    }
}
