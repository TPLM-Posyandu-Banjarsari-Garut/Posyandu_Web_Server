import { NewMidwife, Midwife, midwifes } from '@/db'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface MidwifeQueryFilters {
    search?: string
    user_id?: number
    str_number?: string
    status?: Midwife['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
}

export class MidwifeRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_midwife: NewMidwife): Promise<Midwife> {
        const [midwife] = await this.db
            .insert(midwifes)
            .values(new_midwife)
            .returning()
        return midwife
    }

    async findAll(): Promise<Midwife[]> {
        return this.db
            .select()
            .from(midwifes)
            .where(eq(midwifes.status, 'active'))
    }

    async getMidwifes(filters?: MidwifeQueryFilters) {
        const {
            search,
            user_id,
            str_number,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(midwifes.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(midwifes.status, 'active')
        }

        const whereClause = and(
            search
                ? or(
                      ilike(midwifes.identity_number, `%${search}%`),
                      ilike(midwifes.str_number, `%${search}%`)
                  )
                : undefined,
            user_id ? eq(midwifes.user_id, user_id) : undefined,
            str_number ? eq(midwifes.str_number, str_number) : undefined,
            statusCondition
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(midwifes)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(midwifes)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .select()
            .from(midwifes)
            .where(
                and(
                    eq(midwifes.public_id, public_id),
                    eq(midwifes.status, 'active')
                )
            )
            .limit(1)
        return midwife
    }

    async findByUserId(user_id: number): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .select()
            .from(midwifes)
            .where(
                and(
                    eq(midwifes.user_id, user_id),
                    eq(midwifes.status, 'active')
                )
            )
            .limit(1)
        return midwife
    }

    async findByIdentityNumber(
        identity_number: string
    ): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .select()
            .from(midwifes)
            .where(
                and(
                    eq(midwifes.identity_number, identity_number),
                    eq(midwifes.status, 'active')
                )
            )
            .limit(1)
        return midwife
    }

    async update(
        public_id: string,
        updated_midwife: Partial<NewMidwife>
    ): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .update(midwifes)
            .set(updated_midwife)
            .where(eq(midwifes.public_id, public_id))
            .returning()
        return midwife
    }

    async softDelete(public_id: string): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .update(midwifes)
            .set({
                status: 'inactive'
            })
            .where(eq(midwifes.public_id, public_id))
            .returning()
        return midwife
    }

    async hardDelete(public_id: string): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .delete(midwifes)
            .where(eq(midwifes.public_id, public_id))
            .returning()
        return midwife
    }

    async restore(public_id: string): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .update(midwifes)
            .set({
                status: 'active'
            })
            .where(eq(midwifes.public_id, public_id))
            .returning()
        return midwife
    }

    async existsByStrNumber(str_number: string): Promise<boolean> {
        const [midwife] = await this.db
            .select({ id: midwifes.id })
            .from(midwifes)
            .where(eq(midwifes.str_number, str_number))
            .limit(1)
        return !!midwife
    }

    async existsByIdentityNumber(identity_number: string): Promise<boolean> {
        const [midwife] = await this.db
            .select({ id: midwifes.id })
            .from(midwifes)
            .where(eq(midwifes.identity_number, identity_number))
            .limit(1)
        return !!midwife
    }
}
