import {
    NewEducationCategory,
    EducationCategory,
    educationCategories
} from '@/db'
import { and, eq, ilike, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface EducationCategoryQueryFilters {
    search?: string
    status?: EducationCategory['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
}

export class EducationCategoryRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(
        newCategory: NewEducationCategory
    ): Promise<EducationCategory> {
        const [category] = await this.db
            .insert(educationCategories)
            .values(newCategory)
            .returning()
        return category
    }

    async getCategories(filters?: EducationCategoryQueryFilters) {
        const {
            search,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${educationCategories.deleted_at} IS NULL`)
        }

        if (search) {
            conditions.push(
                sql`(${ilike(educationCategories.name, `%${search}%`)} OR ${ilike(
                    educationCategories.slug,
                    `%${search}%`
                )})`
            )
        }

        if (status) {
            conditions.push(eq(educationCategories.status, status))
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(educationCategories)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(educationCategories)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<EducationCategory | undefined> {
        const [category] = await this.db
            .select()
            .from(educationCategories)
            .where(
                and(
                    eq(educationCategories.id, public_id),
                    sql`${educationCategories.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return category
    }

    async findBySlug(slug: string): Promise<EducationCategory | undefined> {
        const [category] = await this.db
            .select()
            .from(educationCategories)
            .where(
                and(
                    eq(educationCategories.slug, slug),
                    sql`${educationCategories.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return category
    }

    async update(
        public_id: string,
        updatedCategory: Partial<NewEducationCategory>
    ): Promise<EducationCategory | undefined> {
        const [category] = await this.db
            .update(educationCategories)
            .set(updatedCategory)
            .where(eq(educationCategories.id, public_id))
            .returning()
        return category
    }

    async softDelete(
        public_id: string
    ): Promise<EducationCategory | undefined> {
        const [category] = await this.db
            .update(educationCategories)
            .set({
                deleted_at: new Date()
            })
            .where(eq(educationCategories.id, public_id))
            .returning()
        return category
    }

    async hardDelete(
        public_id: string
    ): Promise<EducationCategory | undefined> {
        const [category] = await this.db
            .delete(educationCategories)
            .where(eq(educationCategories.id, public_id))
            .returning()
        return category
    }

    async restore(public_id: string): Promise<EducationCategory | undefined> {
        const [category] = await this.db
            .update(educationCategories)
            .set({
                deleted_at: null
            })
            .where(eq(educationCategories.id, public_id))
            .returning()
        return category
    }
}
