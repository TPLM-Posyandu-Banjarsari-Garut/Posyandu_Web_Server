import { NewHealthCenter, HealthCenter, healthCenters } from '@/db'
import { and, eq, ilike, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface HealthCenterQueryFilters {
    search?: string
    status?: HealthCenter['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
}

export class HealthCenterRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_health_center: NewHealthCenter): Promise<HealthCenter> {
        const [health_center] = await this.db
            .insert(healthCenters)
            .values(new_health_center)
            .returning()
        return health_center
    }

    async findAll(): Promise<HealthCenter[]> {
        return this.db
            .select()
            .from(healthCenters)
            .where(eq(healthCenters.status, 'active'))
    }

    async getHealthCenters(filters?: HealthCenterQueryFilters) {
        const {
            search,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(healthCenters.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(healthCenters.status, 'active')
        }

        const whereClause = and(
            search ? ilike(healthCenters.name, `%${search}%`) : undefined,
            statusCondition
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(healthCenters)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(healthCenters)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<HealthCenter | undefined> {
        const [health_center] = await this.db
            .select()
            .from(healthCenters)
            .where(
                and(
                    eq(healthCenters.id, public_id),
                    eq(healthCenters.status, 'active')
                )
            )
            .limit(1)
        return health_center
    }

    async update(
        public_id: string,
        updated_health_center: Partial<NewHealthCenter>
    ): Promise<HealthCenter | undefined> {
        const [health_center] = await this.db
            .update(healthCenters)
            .set(updated_health_center)
            .where(eq(healthCenters.id, public_id))
            .returning()
        return health_center
    }

    async softDelete(public_id: string): Promise<HealthCenter | undefined> {
        const [health_center] = await this.db
            .update(healthCenters)
            .set({
                status: 'inactive'
            })
            .where(eq(healthCenters.id, public_id))
            .returning()
        return health_center
    }

    async hardDelete(public_id: string): Promise<HealthCenter | undefined> {
        const [health_center] = await this.db
            .delete(healthCenters)
            .where(eq(healthCenters.id, public_id))
            .returning()
        return health_center
    }

    async restore(public_id: string): Promise<HealthCenter | undefined> {
        const [health_center] = await this.db
            .update(healthCenters)
            .set({
                status: 'active'
            })
            .where(eq(healthCenters.id, public_id))
            .returning()
        return health_center
    }

    async existsByName(name: string): Promise<boolean> {
        const [health_center] = await this.db
            .select({ id: healthCenters.id })
            .from(healthCenters)
            .where(eq(healthCenters.name, name))
            .limit(1)
        return !!health_center
    }
}
