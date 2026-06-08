import { NewEducation, Education, educations } from '@/db'
import { and, eq, ilike, sql, or } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface EducationQueryFilters {
    search?: string
    category_id?: string
    posyandu_id?: string
    status?: Education['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
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
            includeDeleted = false
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${educations.deleted_at} IS NULL`)
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

    async findById(public_id: string): Promise<Education | undefined> {
        const [education] = await this.db
            .select()
            .from(educations)
            .where(
                and(
                    eq(educations.id, public_id),
                    sql`${educations.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return education
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

    async softDelete(public_id: string): Promise<Education | undefined> {
        const [education] = await this.db
            .update(educations)
            .set({
                deleted_at: new Date()
            })
            .where(eq(educations.id, public_id))
            .returning()
        return education
    }

    async hardDelete(public_id: string): Promise<Education | undefined> {
        const [education] = await this.db
            .delete(educations)
            .where(eq(educations.id, public_id))
            .returning()
        return education
    }

    async restore(public_id: string): Promise<Education | undefined> {
        const [education] = await this.db
            .update(educations)
            .set({
                deleted_at: null
            })
            .where(eq(educations.id, public_id))
            .returning()
        return education
    }
}
