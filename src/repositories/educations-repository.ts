import { NewEducation, Education, educations } from '@/db'
import { and, eq, ilike, sql, or, SQL, asc, desc } from 'drizzle-orm'
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

export class EducationRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(newEducation: NewEducation): Promise<Education> {
        const [education] = await this.db
            .insert(educations)
            .values(newEducation)
            .returning()
        return education
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

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${educations.deleted_at} IS NULL`)
            if (!status) {
                conditions.push(eq(educations.status, 'active'))
            }
        }

        if (search) {
            conditions.push(
                or(
                    ilike(educations.title, `%${search}%`),
                    ilike(educations.content, `%${search}%`),
                    ilike(educations.summary, `%${search}%`)
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

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(educations)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(educations.created_at)
                        : desc(educations.created_at)
                )
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(educations)
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

    async update(
        public_id: string,
        updatedEducation: Partial<NewEducation>
    ): Promise<Education | undefined> {
        const [education] = await this.db
            .update(educations)
            .set(updatedEducation)
            .where(eq(educations.id, public_id))
            .returning()
        return education
    }
    private async findByCondition(
        condition: SQL | undefined
    ): Promise<Education | undefined> {
        const [row] = await this.db
            .select()
            .from(educations)
            .where(condition)
            .limit(1)
        return row
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<Education | undefined> {
        const [row] = await this.db
            .update(educations)
            .set({ status })
            .where(eq(educations.id, public_id))
            .returning()
        return row
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: educations.id })
            .from(educations)
            .where(condition)
            .limit(1)
        return !!row
    }

    async softDelete(public_id: string): Promise<Education | undefined> {
        const [row] = await this.db
            .update(educations)
            .set({ status: 'inactive', deleted_at: sql`now()` })
            .where(eq(educations.id, public_id))
            .returning()
        return row
    }

    async hardDelete(public_id: string): Promise<Education | undefined> {
        const [education] = await this.db
            .delete(educations)
            .where(eq(educations.id, public_id))
            .returning()
        return education
    }

    async restore(public_id: string): Promise<Education | undefined> {
        const [row] = await this.db
            .update(educations)
            .set({ status: 'active', deleted_at: null })
            .where(eq(educations.id, public_id))
            .returning()
        return row
    }
}
