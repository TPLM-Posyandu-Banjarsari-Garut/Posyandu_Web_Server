import { NewHealthCenter, HealthCenter } from '@/db'
import {
    HealthCenterRepository,
    HealthCenterQueryFilters
} from '@/repositories/health-centers-repository'

export class HealthCenterService {
    constructor(
        private readonly health_center_repository: HealthCenterRepository
    ) {}

    async createHealthCenter(
        health_center_payload: NewHealthCenter
    ): Promise<HealthCenter> {
        const isNameUsed = await this.health_center_repository.existsByName(
            health_center_payload.name
        )
        if (isNameUsed) {
            throw new Error('Health Center name is already registered')
        }

        return this.health_center_repository.create(health_center_payload)
    }

    async getHealthCenters(query_filters?: HealthCenterQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.health_center_repository.getHealthCenters(query_filters)

        return {
            data,
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / limit)
            }
        }
    }

    async getHealthCenterById(public_id: string): Promise<HealthCenter> {
        const health_center =
            await this.health_center_repository.findById(public_id)
        if (!health_center) throw new Error('Health Center not found')
        return health_center
    }

    async updateHealthCenter(
        public_id: string,
        health_center_payload: Partial<NewHealthCenter>
    ): Promise<HealthCenter> {
        const existingHealthCenter = await this.getHealthCenterById(public_id)

        if (
            health_center_payload.name &&
            health_center_payload.name !== existingHealthCenter.name
        ) {
            const isNameUsed = await this.health_center_repository.existsByName(
                health_center_payload.name
            )
            if (isNameUsed) {
                throw new Error(
                    'Health Center name is already registered by another health center'
                )
            }
        }

        const updated = await this.health_center_repository.update(
            public_id,
            health_center_payload
        )
        if (!updated) throw new Error('Failed to update health center')
        return updated
    }

    async deleteHealthCenter(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<HealthCenter> {
        await this.getHealthCenterById(public_id)

        const deleted = is_permanent
            ? await this.health_center_repository.hardDelete(public_id)
            : await this.health_center_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete health center')
        return deleted
    }

    async restoreHealthCenter(public_id: string): Promise<HealthCenter> {
        const restored = await this.health_center_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore health center')
        return restored
    }
}
