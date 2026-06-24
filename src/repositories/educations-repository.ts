import { NewEducation, Education, educations } from '@/db'
import { BaseRepository } from '@/repositories/base-repository'
import { sanitizeSearchTerm } from '@/utils/sanitize'
import {
    and,
    eq,
    ilike,
    sql,
    or,
    SQL,
    asc,
    desc,
    getTableColumns
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface EducationQueryFilters {
    search?: string
    category_id?: string
    posyandu_id?: string
    status?: Education['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class EducationRepository extends BaseRepository<
    typeof educations,
    Education,
    NewEducation
> {
    constructor(db: NodePgDatabase<Record<string, never>>) {
        super(db, educations)
    }

    async getEducations(filters?: EducationQueryFilters) {
        const {
            search,
            category_id,
            posyandu_id,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const escapedSearch = search ? sanitizeSearchTerm(search) : undefined

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${educations.deleted_at} IS NULL`)
            if (!status) {
                conditions.push(eq(educations.status, 'active'))
            }
        }

        if (escapedSearch) {
            conditions.push(
                or(
                    ilike(educations.title, `%${escapedSearch}%`),
                    ilike(educations.content, `%${escapedSearch}%`),
                    ilike(educations.summary, `%${escapedSearch}%`)
                )
            )
        }

        if (category_id) {
            conditions.push(eq(educations.category_id, category_id))
        }

        if (posyandu_id) {
            conditions.push(eq(educations.posyandu_id, posyandu_id))
        }

        if (status) {
            conditions.push(eq(educations.status, status))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(educations),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(educations)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(educations.created_at)
                    : desc(educations.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(educations)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(
            ({ total_count, ...education }) => education
        )

        return {
            data,
            totalItems
        }
    }

    async findById(
        public_id: string,
        includeDeleted = false
    ): Promise<Education | undefined> {
        const condition = includeDeleted
            ? eq(educations.id, public_id)
            : and(eq(educations.id, public_id), eq(educations.status, 'active'))
        return this.findByCondition(condition)
    }

    async incrementViews(public_id: string): Promise<Education | undefined> {
        const [education] = await this.db
            .update(educations)
            .set({
                views_count: sql`${educations.views_count} + 1`
            })
            .where(eq(educations.id, public_id))
            .returning()
        return education
    }

    async softDelete(public_id: string): Promise<Education | undefined> {
        const [row] = await this.db
            .update(educations)
            .set({ deleted_at: new Date(), is_deleted: true })
            .where(eq(educations.id, public_id))
            .returning()
        return row
    }

    async restore(public_id: string): Promise<Education | undefined> {
        const [row] = await this.db
            .update(educations)
            .set({ deleted_at: null, is_deleted: false })
            .where(eq(educations.id, public_id))
            .returning()
        return row
    }
}
