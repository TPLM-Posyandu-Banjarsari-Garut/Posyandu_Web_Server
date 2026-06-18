import { NewExamination, Examination, examinations } from '@/db'
import { and, eq, sql, ilike, or, asc, desc } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ExaminationsQueryFilters {
    search?: string
    posyandu_id?: string
    examination_type?: Examination['examination_type']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class ExaminationsRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_examination: NewExamination): Promise<Examination> {
        const [record] = await this.db
            .insert(examinations)
            .values(new_examination)
            .returning()
        return record
    }

    async getExaminations(filters?: ExaminationsQueryFilters) {
        const {
            search,
            posyandu_id,
            examination_type,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${examinations.deleted_at} IS NULL`)
        }

        if (posyandu_id) {
            conditions.push(eq(examinations.posyandu_id, posyandu_id))
        }

        if (examination_type) {
            conditions.push(eq(examinations.examination_type, examination_type))
        }

        if (search) {
            conditions.push(
                or(
                    ilike(examinations.name, `%${search}%`),
                    ilike(examinations.description, `%${search}%`)
                )
            )
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(examinations)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(examinations.created_at)
                        : desc(examinations.created_at)
                )
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(examinations)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(id: string): Promise<Examination | undefined> {
        const [record] = await this.db
            .select()
            .from(examinations)
            .where(
                and(
                    eq(examinations.id, id),
                    sql`${examinations.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return record
    }

    async update(
        id: string,
        updated_examination: Partial<NewExamination>
    ): Promise<Examination | undefined> {
        const [record] = await this.db
            .update(examinations)
            .set(updated_examination)
            .where(eq(examinations.id, id))
            .returning()
        return record
    }

    async softDelete(id: string): Promise<Examination | undefined> {
        const [record] = await this.db
            .update(examinations)
            .set({
                deleted_at: new Date()
            })
            .where(eq(examinations.id, id))
            .returning()
        return record
    }

    async hardDelete(id: string): Promise<Examination | undefined> {
        const [record] = await this.db
            .delete(examinations)
            .where(eq(examinations.id, id))
            .returning()
        return record
    }

    async restore(id: string): Promise<Examination | undefined> {
        const [record] = await this.db
            .update(examinations)
            .set({
                deleted_at: null
            })
            .where(eq(examinations.id, id))
            .returning()
        return record
    }
}
