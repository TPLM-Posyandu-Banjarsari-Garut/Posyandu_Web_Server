import { NewMidwife, Midwife, midwifes, users } from '@/db'
import {
    and,
    eq,
    ilike,
    or,
    sql,
    SQL,
    asc,
    desc,
    getTableColumns
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface MidwifeQueryFilters {
    search?: string
    posyandu_id?: string
    str_number?: string
    status?: Midwife['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
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
            posyandu_id,
            str_number,
            status,
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

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(midwifes.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(midwifes.status, 'active')
        }

        const whereClause = and(
            escapedSearch
                ? or(
                      ilike(midwifes.identity_number, `%${escapedSearch}%`),
                      ilike(midwifes.license_number, `%${escapedSearch}%`)
                  )
                : undefined,
            posyandu_id ? eq(midwifes.posyandu_id, posyandu_id) : undefined,
            str_number ? eq(midwifes.license_number, str_number) : undefined,
            statusCondition
        )

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(midwifes),
                name: users.name,
                email: users.email,
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(midwifes)
            .innerJoin(users, eq(midwifes.user_id, users.id))
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(midwifes.created_at)
                    : desc(midwifes.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(midwifes)
                .innerJoin(users, eq(midwifes.user_id, users.id))
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...midwife }) => midwife)

        return {
            data,
            totalItems
        }
    }

    async findById(
        public_id: string,
        includeDeleted = false
    ): Promise<Midwife | undefined> {
        const condition = includeDeleted
            ? eq(midwifes.id, public_id)
            : and(eq(midwifes.id, public_id), eq(midwifes.status, 'active'))
        return this.findByCondition(condition)
    }

    async findByUserId(user_id: string): Promise<Midwife | undefined> {
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
            .where(eq(midwifes.id, public_id))
            .returning()
        return midwife
    }
    private async findByCondition(
        condition: SQL | undefined
    ): Promise<Midwife | undefined> {
        const [row] = await this.db
            .select()
            .from(midwifes)
            .where(condition)
            .limit(1)
        return row
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<Midwife | undefined> {
        const [row] = await this.db
            .update(midwifes)
            .set({ status })
            .where(eq(midwifes.id, public_id))
            .returning()
        return row
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: midwifes.id })
            .from(midwifes)
            .where(condition)
            .limit(1)
        return !!row
    }

    async softDelete(public_id: string): Promise<Midwife | undefined> {
        return this.updateStatus(public_id, 'inactive')
    }

    async hardDelete(public_id: string): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .delete(midwifes)
            .where(eq(midwifes.id, public_id))
            .returning()
        return midwife
    }

    async restore(public_id: string): Promise<Midwife | undefined> {
        return this.updateStatus(public_id, 'active')
    }

    async existsByStrNumber(str_number: string): Promise<boolean> {
        const [midwife] = await this.db
            .select({ id: midwifes.id })
            .from(midwifes)
            .where(eq(midwifes.license_number, str_number))
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

    async checkUniqueConstraints(data: {
        user_id?: string | null
        identity_number?: string | null
        license_number?: string | null
    }) {
        const [userExists, identityExists, licenseExists] = await Promise.all([
            data.user_id
                ? this.checkExists(
                      and(
                          eq(midwifes.user_id, data.user_id),
                          eq(midwifes.status, 'active')
                      )
                  )
                : Promise.resolve(false),
            data.identity_number
                ? this.existsByIdentityNumber(data.identity_number)
                : Promise.resolve(false),
            data.license_number
                ? this.existsByStrNumber(data.license_number)
                : Promise.resolve(false)
        ])
        return {
            userExists,
            identityExists,
            licenseExists
        }
    }
}
