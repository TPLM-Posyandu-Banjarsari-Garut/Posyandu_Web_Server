import { NewHealthCenter, HealthCenter, healthCenters } from '@/db'
import { and, eq, ilike, sql, SQL } from 'drizzle-orm'
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
        return this.findByCondition(
            and(
                eq(healthCenters.id, public_id),
                eq(healthCenters.status, 'active')
            )
        )
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
    private async findByCondition(
        condition: SQL | undefined
    ): Promise<HealthCenter | undefined> {
        const [row] = await this.db
            .select()
            .from(healthCenters)
            .where(condition)
            .limit(1)
        return row
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<HealthCenter | undefined> {
        const [row] = await this.db
            .update(healthCenters)
            .set({ status })
            .where(eq(healthCenters.id, public_id))
            .returning()
        return row
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: healthCenters.id })
            .from(healthCenters)
            .where(condition)
            .limit(1)
        return !!row
    }

    async softDelete(public_id: string): Promise<HealthCenter | undefined> {
        return this.updateStatus(public_id, 'inactive')
    }

    async hardDelete(public_id: string): Promise<HealthCenter | undefined> {
        const [health_center] = await this.db
            .delete(healthCenters)
            .where(eq(healthCenters.id, public_id))
            .returning()
        return health_center
    }

    async restore(public_id: string): Promise<HealthCenter | undefined> {
        return this.updateStatus(public_id, 'active')
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
