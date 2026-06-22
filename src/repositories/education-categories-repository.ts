import {
    NewEducationCategory,
    EducationCategory,
    educationCategories
} from '@/db'
import {
    and,
    eq,
    ilike,
    sql,
    or,
    asc,
    desc,
    getTableColumns
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface EducationCategoryQueryFilters {
    search?: string
    status?: EducationCategory['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
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
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const escapedSearch = search
            ? search.replace(/[%_\\]/g, '\\$&')
            : undefined

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${educationCategories.deleted_at} IS NULL`)
        }

        if (escapedSearch) {
            conditions.push(
                or(
                    ilike(educationCategories.name, `%${escapedSearch}%`),
                    ilike(educationCategories.slug, `%${escapedSearch}%`)
                )
            )
        }

        if (status) {
            conditions.push(eq(educationCategories.status, status))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(educationCategories),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(educationCategories)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(educationCategories.created_at)
                    : desc(educationCategories.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(educationCategories)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(
            ({ total_count, ...category }) => category
        )

        return {
            data,
            totalItems
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
