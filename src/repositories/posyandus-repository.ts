import { NewPosyandu, Posyandu, posyandus } from '@/db'
import { BaseRepository } from '@/repositories/base-repository'
import { sanitizeSearchTerm } from '@/utils/sanitize'
import {
    and,
    eq,
    ilike,
    sql,
    SQL,
    asc,
    desc,
    getTableColumns
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface PosyanduQueryFilters {
    search?: string
    status?: Posyandu['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class PosyanduRepository extends BaseRepository<
    typeof posyandus,
    Posyandu,
    NewPosyandu
> {
    constructor(db: NodePgDatabase<Record<string, never>>) {
        super(db, posyandus)
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

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const escapedSearch = search ? sanitizeSearchTerm(search) : undefined

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(posyandus.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(posyandus.status, 'active')
        }

        const whereClause = and(
            escapedSearch
                ? ilike(posyandus.name, `%${escapedSearch}%`)
                : undefined,
            statusCondition
        )

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(posyandus),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(posyandus)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(posyandus.created_at)
                    : desc(posyandus.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(posyandus)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(
            ({ total_count, ...posyandu }) => posyandu
        )

        return {
            data,
            totalItems
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

    async updateStatus(
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

    async softDelete(public_id: string): Promise<Posyandu | undefined> {
        return this.updateStatus(public_id, 'inactive')
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

    async checkUniqueConstraints(data: { name?: string | null }) {
        const nameExists = data.name
            ? await this.existsByName(data.name)
            : false
        return {
            nameExists
        }
    }
}
