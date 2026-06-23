import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'
import { NewNutritionRecord, NutritionRecord } from '@/db'
import {
    NutritionRecordRepository,
    NutritionRecordQueryFilters
} from '@/repositories/nutrition-records-repository'

export class NutritionRecordService {
    constructor(
        private readonly nutrition_record_repository: NutritionRecordRepository
    ) {}

    async createNutritionRecord(
        record_payload: NewNutritionRecord
    ): Promise<NutritionRecord> {
        return this.nutrition_record_repository.create(record_payload)
    }

    async getNutritionRecords(query_filters?: NutritionRecordQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.nutrition_record_repository.getNutritionRecords(
                query_filters
            )

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getNutritionRecordById(public_id: string): Promise<NutritionRecord> {
        const record =
            await this.nutrition_record_repository.findById(public_id)
        if (!record) throw ApiError.notFound('Nutrition record not found')
        return record
    }

    async updateNutritionRecord(
        public_id: string,
        record_payload: Partial<NewNutritionRecord>
    ): Promise<NutritionRecord> {
        await this.getNutritionRecordById(public_id)

        const updated = await this.nutrition_record_repository.update(
            public_id,
            record_payload
        )
        if (!updated)
            throw ApiError.badRequest('Failed to update nutrition record')
        return updated
    }

    async deleteNutritionRecord(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<NutritionRecord> {
        await this.getNutritionRecordById(public_id)

        const deleted = is_permanent
            ? await this.nutrition_record_repository.hardDelete(public_id)
            : await this.nutrition_record_repository.softDelete(public_id)

        if (!deleted)
            throw ApiError.badRequest('Failed to delete nutrition record')
        return deleted
    }

    async restoreNutritionRecord(public_id: string): Promise<NutritionRecord> {
        const restored =
            await this.nutrition_record_repository.restore(public_id)
        if (!restored)
            throw ApiError.badRequest('Failed to restore nutrition record')
        return restored
    }
}
