import { NewVaccine, Vaccine, vaccines } from '@/db'
import { and, eq, ilike, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface VaccineQueryFilters {
    search?: string
    route?: Vaccine['route']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class VaccineRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_vaccine: NewVaccine): Promise<Vaccine> {
        const [vaccine] = await this.db
            .insert(vaccines)
            .values(new_vaccine)
            .returning()
        return vaccine
    }

    async findAll(): Promise<Vaccine[]> {
        return this.db
            .select()
            .from(vaccines)
            .where(sql`${vaccines.deleted_at} IS NULL`)
    }

    async getVaccines(filters?: VaccineQueryFilters) {
        const {
            search,
            route,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${vaccines.deleted_at} IS NULL`)
        }

        if (search) {
            conditions.push(ilike(vaccines.name, `%${search}%`))
        }

        if (route) {
            conditions.push(eq(vaccines.route, route))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(vaccines),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(vaccines)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(vaccines.created_at)
                    : desc(vaccines.created_at)
            )
            .limit(limit)
            .offset((page - 1) * limit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(vaccines)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...vaccine }) => vaccine)

        return {
            data,
            totalItems
        }
    }

    async findById(public_id: string): Promise<Vaccine | undefined> {
        const [vaccine] = await this.db
            .select()
            .from(vaccines)
            .where(
                and(
                    eq(vaccines.id, public_id),
                    sql`${vaccines.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return vaccine
    }

    async update(
        public_id: string,
        updated_vaccine: Partial<NewVaccine>
    ): Promise<Vaccine | undefined> {
        const [vaccine] = await this.db
            .update(vaccines)
            .set(updated_vaccine)
            .where(eq(vaccines.id, public_id))
            .returning()
        return vaccine
    }

    async softDelete(public_id: string): Promise<Vaccine | undefined> {
        const [vaccine] = await this.db
            .update(vaccines)
            .set({
                deleted_at: new Date()
            })
            .where(eq(vaccines.id, public_id))
            .returning()
        return vaccine
    }

    async hardDelete(public_id: string): Promise<Vaccine | undefined> {
        const [vaccine] = await this.db
            .delete(vaccines)
            .where(eq(vaccines.id, public_id))
            .returning()
        return vaccine
    }

    async restore(public_id: string): Promise<Vaccine | undefined> {
        const [vaccine] = await this.db
            .update(vaccines)
            .set({
                deleted_at: null
            })
            .where(eq(vaccines.id, public_id))
            .returning()
        return vaccine
    }

    async existsByName(name: string): Promise<boolean> {
        const [vaccine] = await this.db
            .select({ id: vaccines.id })
            .from(vaccines)
            .where(eq(vaccines.name, name))
            .limit(1)
        return !!vaccine
    }

    async existsByCode(code: string): Promise<boolean> {
        const [vaccine] = await this.db
            .select({ id: vaccines.id })
            .from(vaccines)
            .where(eq(vaccines.code, code))
            .limit(1)
        return !!vaccine
    }
}
