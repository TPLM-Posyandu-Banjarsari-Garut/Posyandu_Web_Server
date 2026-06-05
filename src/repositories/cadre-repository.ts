import { NewCadre, Cadre, cadres } from '@/db'
import { and, eq, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface CadreQueryFilters {
    user_id?: number
    posyandu_id?: number
    position?: Cadre['position']
    status?: Cadre['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
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
            user_id,
            posyandu_id,
            position,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(cadres.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(cadres.status, 'active')
        }

        const whereClause = and(
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

    async findById(public_id: string): Promise<Cadre | undefined> {
        const [cadre] = await this.db
            .select()
            .from(cadres)
            .where(
                and(
                    eq(cadres.public_id, public_id),
                    eq(cadres.status, 'active')
                )
            )
            .limit(1)
        return cadre
    }

    async findByUserId(user_id: number): Promise<Cadre[]> {
        return this.db
            .select()
            .from(cadres)
            .where(
                and(eq(cadres.user_id, user_id), eq(cadres.status, 'active'))
            )
    }

    async findByPosyanduId(posyandu_id: number): Promise<Cadre[]> {
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
            .where(eq(cadres.public_id, public_id))
            .returning()
        return cadre
    }

    async softDelete(public_id: string): Promise<Cadre | undefined> {
        const [cadre] = await this.db
            .update(cadres)
            .set({
                status: 'inactive'
            })
            .where(eq(cadres.public_id, public_id))
            .returning()
        return cadre
    }

    async hardDelete(public_id: string): Promise<Cadre | undefined> {
        const [cadre] = await this.db
            .delete(cadres)
            .where(eq(cadres.public_id, public_id))
            .returning()
        return cadre
    }

    async restore(public_id: string): Promise<Cadre | undefined> {
        const [cadre] = await this.db
            .update(cadres)
            .set({
                status: 'active'
            })
            .where(eq(cadres.public_id, public_id))
            .returning()
        return cadre
    }
}
