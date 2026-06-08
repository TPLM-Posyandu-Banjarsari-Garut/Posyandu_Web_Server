import { NewPosyandu, Posyandu, posyandus } from '@/db'
import { and, eq, ilike, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface PosyanduQueryFilters {
    search?: string
    health_center_id?: string
    status?: Posyandu['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
}

export class PosyanduRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_posyandu: NewPosyandu): Promise<Posyandu> {
        const [posyandu] = await this.db
            .insert(posyandus)
            .values(new_posyandu)
            .returning()
        return posyandu
    }

    async findAll(): Promise<Posyandu[]> {
        return this.db
            .select()
            .from(posyandus)
            .where(eq(posyandus.status, 'active'))
    }

    async getPosyandus(filters?: PosyanduQueryFilters) {
        const {
            search,
            health_center_id,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(posyandus.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(posyandus.status, 'active')
        }

        const whereClause = and(
            search ? ilike(posyandus.name, `%${search}%`) : undefined,
            health_center_id
                ? eq(posyandus.health_center_id, health_center_id)
                : undefined,
            statusCondition
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(posyandus)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(posyandus)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<Posyandu | undefined> {
        const [posyandu] = await this.db
            .select()
            .from(posyandus)
            .where(
                and(eq(posyandus.id, public_id), eq(posyandus.status, 'active'))
            )
            .limit(1)
        return posyandu
    }

    async findByHealthCenterId(health_center_id: string): Promise<Posyandu[]> {
        return this.db
            .select()
            .from(posyandus)
            .where(
                and(
                    eq(posyandus.health_center_id, health_center_id),
                    eq(posyandus.status, 'active')
                )
            )
    }

    async update(
        public_id: string,
        updated_posyandu: Partial<NewPosyandu>
    ): Promise<Posyandu | undefined> {
        const [posyandu] = await this.db
            .update(posyandus)
            .set(updated_posyandu)
            .where(eq(posyandus.id, public_id))
            .returning()
        return posyandu
    }

    async softDelete(public_id: string): Promise<Posyandu | undefined> {
        const [posyandu] = await this.db
            .update(posyandus)
            .set({
                status: 'inactive'
            })
            .where(eq(posyandus.id, public_id))
            .returning()
        return posyandu
    }

    async hardDelete(public_id: string): Promise<Posyandu | undefined> {
        const [posyandu] = await this.db
            .delete(posyandus)
            .where(eq(posyandus.id, public_id))
            .returning()
        return posyandu
    }

    async restore(public_id: string): Promise<Posyandu | undefined> {
        const [posyandu] = await this.db
            .update(posyandus)
            .set({
                status: 'active'
            })
            .where(eq(posyandus.id, public_id))
            .returning()
        return posyandu
    }

    async existsByName(name: string): Promise<boolean> {
        const [posyandu] = await this.db
            .select({ id: posyandus.id })
            .from(posyandus)
            .where(eq(posyandus.name, name))
            .limit(1)
        return !!posyandu
    }
}
