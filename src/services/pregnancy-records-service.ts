import { createPaginationMeta } from '@/utils/pagination'
import { NewPregnancyRecord, PregnancyRecord } from '@/db'
import {
    PregnancyRecordsRepository,
    PregnancyRecordQueryFilters
} from '@/repositories/pregnancy-records-repository'
import { ApiError } from '@/utils/api-error'
import type { AuthenticatedUser } from '@/services/auth-service'

export class PregnancyRecordsService {
    constructor(
        private readonly pregnancy_records_repository: PregnancyRecordsRepository
    ) {}

    async createPregnancyRecord(
        payload: NewPregnancyRecord,
        currentUser: AuthenticatedUser
    ): Promise<PregnancyRecord> {
        this.assertCanWrite(currentUser)
        return this.pregnancy_records_repository.create(payload)
    }

    async getPregnancyRecords(
        filters: PregnancyRecordQueryFilters | undefined,
        currentUser: AuthenticatedUser
    ) {
        const { page = 1, limit = 10 } = filters || {}
        const scopedFilters = { ...filters }
        if (currentUser.role === 'parent') {
            scopedFilters.parent_id = currentUser.parent_id ?? ''
        }

        const { data, totalItems } =
            await this.pregnancy_records_repository.getPregnancyRecords(
                scopedFilters
            )

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getPregnancyRecordById(
        id: string,
        currentUser: AuthenticatedUser,
        includeDeleted = false
    ): Promise<PregnancyRecord> {
        const record = await this.pregnancy_records_repository.findById(
            id,
            includeDeleted
        )
        if (!record) throw ApiError.notFound('Pregnancy record not found')
        this.assertRecordAccess(record, currentUser)
        return record
    }

    async updatePregnancyRecord(
        id: string,
        payload: Partial<NewPregnancyRecord>,
        currentUser: AuthenticatedUser
    ): Promise<PregnancyRecord> {
        this.assertCanWrite(currentUser)
        const existing = await this.getPregnancyRecordById(id, currentUser)

        if (
            payload.parent_id !== undefined &&
            payload.parent_id !== existing.parent_id &&
            currentUser.role !== 'posyandu_admin' &&
            currentUser.role !== 'village_admin' &&
            currentUser.role !== 'admin'
        ) {
            throw ApiError.forbidden(
                'Staff cannot change pregnancy record ownership'
            )
        }

        const updated = await this.pregnancy_records_repository.update(
            id,
            payload
        )
        if (!updated) throw ApiError.server('Failed to update pregnancy record')
        return updated
    }

    async deletePregnancyRecord(
        id: string,
        isPermanent: boolean,
        currentUser: AuthenticatedUser
    ): Promise<PregnancyRecord> {
        this.assertCanWrite(currentUser)
        await this.getPregnancyRecordById(id, currentUser)

        const deleted = isPermanent
            ? await this.pregnancy_records_repository.hardDelete(id)
            : await this.pregnancy_records_repository.softDelete(id)

        if (!deleted) throw ApiError.server('Failed to delete pregnancy record')
        return deleted
    }

    async restorePregnancyRecord(
        id: string,
        currentUser: AuthenticatedUser
    ): Promise<PregnancyRecord> {
        this.assertCanWrite(currentUser)
        await this.getPregnancyRecordById(id, currentUser, true)
        const restored = await this.pregnancy_records_repository.restore(id)
        if (!restored)
            throw ApiError.server('Failed to restore pregnancy record')
        return restored
    }

    private assertRecordAccess(
        record: PregnancyRecord,
        currentUser: AuthenticatedUser
    ): void {
        if (
            currentUser.role === 'parent' &&
            currentUser.parent_id === record.parent_id
        ) {
            return
        }
        if (currentUser.role === 'cadre' || currentUser.role === 'midwife') {
            return
        }
        if (
            currentUser.role === 'admin' ||
            currentUser.role === 'posyandu_admin' ||
            currentUser.role === 'village_admin'
        ) {
            return
        }
        throw ApiError.forbidden(
            'You do not have permission to access this pregnancy record'
        )
    }

    private assertCanWrite(currentUser: AuthenticatedUser): void {
        if (currentUser.role === 'parent') {
            throw ApiError.forbidden('Parents cannot modify pregnancy records')
        }
    }
}
