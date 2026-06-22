import { NewCadre, Cadre, cadres } from '@/db'
import { and, eq, ilike, or, sql, SQL, asc, desc } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface CadreQueryFilters {
    search?: string
    user_id?: string
    posyandu_id?: string
    position?: Cadre['position']
    status?: Cadre['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class CadreRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_cadre: NewCadre): Promise<Cadre> {
        const [cadre] = await this.db
            .insert(cadres)
            .values(new_cadre)
            .returning()
        return cadre
    }

    async findAll(): Promise<Cadre[]> {
        return this.db.select().from(cadres).where(eq(cadres.status, 'active'))
    }

    async getCadres(filters?: CadreQueryFilters) {
        const {
            search,
            user_id,
            posyandu_id,
            position,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(cadres.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(cadres.status, 'active')
        }

        const whereClause = and(
            search
                ? or(
                      ilike(cadres.identity_number, `%${search}%`),
                      ilike(cadres.duty_area_notes, `%${search}%`)
                  )
                : undefined,
            user_id ? eq(cadres.user_id, user_id) : undefined,
            posyandu_id ? eq(cadres.posyandu_id, posyandu_id) : undefined,
            position ? eq(cadres.position, position) : undefined,
            statusCondition
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(cadres)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(cadres.created_at)
                        : desc(cadres.created_at)
                )
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(cadres)
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
    ): Promise<Cadre | undefined> {
        const condition = includeDeleted
            ? eq(cadres.id, public_id)
            : and(eq(cadres.id, public_id), eq(cadres.status, 'active'))
        return this.findByCondition(condition)
    }

    async findByUserId(user_id: string): Promise<Cadre[]> {
        return this.db
            .select()
            .from(cadres)
            .where(
                and(eq(cadres.user_id, user_id), eq(cadres.status, 'active'))
            )
    }

    async findByPosyanduId(posyandu_id: string): Promise<Cadre[]> {
        return this.db
            .select()
            .from(cadres)
            .where(
                and(
                    eq(cadres.posyandu_id, posyandu_id),
                    eq(cadres.status, 'active')
                )
            )
    }

    async update(
        public_id: string,
        updated_cadre: Partial<NewCadre>
    ): Promise<Cadre | undefined> {
        const [cadre] = await this.db
            .update(cadres)
            .set(updated_cadre)
            .where(eq(cadres.id, public_id))
            .returning()
        return cadre
    }
    private async findByCondition(
        condition: SQL | undefined
    ): Promise<Cadre | undefined> {
        const [row] = await this.db
            .select()
            .from(cadres)
            .where(condition)
            .limit(1)
        return row
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<Cadre | undefined> {
        const [row] = await this.db
            .update(cadres)
            .set({ status })
            .where(eq(cadres.id, public_id))
            .returning()
        return row
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: cadres.id })
            .from(cadres)
            .where(condition)
            .limit(1)
        return !!row
    }

    async softDelete(public_id: string): Promise<Cadre | undefined> {
        return this.updateStatus(public_id, 'inactive')
    }

    async hardDelete(public_id: string): Promise<Cadre | undefined> {
        const [cadre] = await this.db
            .delete(cadres)
            .where(eq(cadres.id, public_id))
            .returning()
        return cadre
    }

    async restore(public_id: string): Promise<Cadre | undefined> {
        return this.updateStatus(public_id, 'active')
    }
}
