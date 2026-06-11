import { NewVitamin, Vitamin, vitamins } from '@/db'
import { and, eq, ilike, sql, asc, desc } from 'drizzle-orm'
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

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${vitamins.deleted_at} IS NULL`)
        }

        if (search) {
            conditions.push(ilike(vitamins.name, `%${search}%`))
        }

        if (capsule_color) {
            conditions.push(eq(vitamins.capsule_color, capsule_color))
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(vitamins)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(vitamins.created_at)
                        : desc(vitamins.created_at)
                )
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(vitamins)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
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
}
