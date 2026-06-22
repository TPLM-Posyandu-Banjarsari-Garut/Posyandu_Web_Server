import { NewVitamin, Vitamin, vitamins } from '@/db'
import { and, eq, ilike, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface VitaminQueryFilters {
    search?: string
    capsule_color?: Vitamin['capsule_color']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class VitaminRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_vitamin: NewVitamin): Promise<Vitamin> {
        const [vitamin] = await this.db
            .insert(vitamins)
            .values(new_vitamin)
            .returning()
        return vitamin
    }

    async findAll(): Promise<Vitamin[]> {
        return this.db
            .select()
            .from(vitamins)
            .where(sql`${vitamins.deleted_at} IS NULL`)
    }

    async getVitamins(filters?: VitaminQueryFilters) {
        const {
            search,
            capsule_color,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const escapedSearch = search
            ? search.replace(/[%_\\]/g, '\\$&')
            : undefined

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${vitamins.deleted_at} IS NULL`)
        }

        if (escapedSearch) {
            conditions.push(ilike(vitamins.name, `%${escapedSearch}%`))
        }

        if (capsule_color) {
            conditions.push(eq(vitamins.capsule_color, capsule_color))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(vitamins),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(vitamins)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(vitamins.created_at)
                    : desc(vitamins.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(vitamins)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...vitamin }) => vitamin)

        return {
            data,
            totalItems
        }
    }

    async findById(public_id: string): Promise<Vitamin | undefined> {
        const [vitamin] = await this.db
            .select()
            .from(vitamins)
            .where(
                and(
                    eq(vitamins.id, public_id),
                    sql`${vitamins.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return vitamin
    }

    async update(
        public_id: string,
        updated_vitamin: Partial<NewVitamin>
    ): Promise<Vitamin | undefined> {
        const [vitamin] = await this.db
            .update(vitamins)
            .set(updated_vitamin)
            .where(eq(vitamins.id, public_id))
            .returning()
        return vitamin
    }

    async softDelete(public_id: string): Promise<Vitamin | undefined> {
        const [vitamin] = await this.db
            .update(vitamins)
            .set({
                deleted_at: new Date()
            })
            .where(eq(vitamins.id, public_id))
            .returning()
        return vitamin
    }

    async hardDelete(public_id: string): Promise<Vitamin | undefined> {
        const [vitamin] = await this.db
            .delete(vitamins)
            .where(eq(vitamins.id, public_id))
            .returning()
        return vitamin
    }

    async restore(public_id: string): Promise<Vitamin | undefined> {
        const [vitamin] = await this.db
            .update(vitamins)
            .set({
                deleted_at: null
            })
            .where(eq(vitamins.id, public_id))
            .returning()
        return vitamin
    }

    async existsByName(name: string): Promise<boolean> {
        const [vitamin] = await this.db
            .select({ id: vitamins.id })
            .from(vitamins)
            .where(eq(vitamins.name, name))
            .limit(1)
        return !!vitamin
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
