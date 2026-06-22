import { NewPosyandu, Posyandu, posyandus } from '@/db'
import { and, eq, ilike, sql, SQL, asc, desc } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface PosyanduQueryFilters {
    search?: string
    status?: Posyandu['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
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
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(posyandus.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(posyandus.status, 'active')
        }

        const whereClause = and(
            search ? ilike(posyandus.name, `%${search}%`) : undefined,
            statusCondition
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(posyandus)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(posyandus.created_at)
                        : desc(posyandus.created_at)
                )
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

    async findById(
        public_id: string,
        includeDeleted = false
    ): Promise<Posyandu | undefined> {
        const condition = includeDeleted
            ? eq(posyandus.id, public_id)
            : and(eq(posyandus.id, public_id), eq(posyandus.status, 'active'))
        return this.findByCondition(condition)
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
    private async findByCondition(
        condition: SQL | undefined
    ): Promise<Posyandu | undefined> {
        const [row] = await this.db
            .select()
            .from(posyandus)
            .where(condition)
            .limit(1)
        return row
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<Posyandu | undefined> {
        const [row] = await this.db
            .update(posyandus)
            .set({ status })
            .where(eq(posyandus.id, public_id))
            .returning()
        return row
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: posyandus.id })
            .from(posyandus)
            .where(condition)
            .limit(1)
        return !!row
    }

    async softDelete(public_id: string): Promise<Posyandu | undefined> {
        return this.updateStatus(public_id, 'inactive')
    }

    async hardDelete(public_id: string): Promise<Posyandu | undefined> {
        const [posyandu] = await this.db
            .delete(posyandus)
            .where(eq(posyandus.id, public_id))
            .returning()
        return posyandu
    }

    async restore(public_id: string): Promise<Posyandu | undefined> {
        return this.updateStatus(public_id, 'active')
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
