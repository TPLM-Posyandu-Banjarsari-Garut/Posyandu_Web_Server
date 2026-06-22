import { NewMedia, Media, media } from '@/db'
import { and, eq, ilike, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface MediaQueryFilters {
    uploaded_by?: string
    search?: string
    file_category?: string
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class MediaRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_media: NewMedia): Promise<Media> {
        const [inserted] = await this.db
            .insert(media)
            .values(new_media)
            .returning()
        return inserted
    }

    async getMedias(filters?: MediaQueryFilters) {
        const {
            uploaded_by,
            search,
            file_category,
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
            conditions.push(sql`${media.deleted_at} IS NULL`)
        }

        if (uploaded_by) {
            conditions.push(eq(media.uploaded_by, uploaded_by))
        }

        if (escapedSearch) {
            conditions.push(ilike(media.original_name, `%${escapedSearch}%`))
        }

        if (file_category) {
            conditions.push(eq(media.file_category, file_category))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(media),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(media)
            .where(whereClause)
            .orderBy(
                order === 'asc' ? asc(media.created_at) : desc(media.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(media)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...m }) => m)

        return {
            data,
            totalItems
        }
    }

    async findById(id: string): Promise<Media | undefined> {
        const [res] = await this.db
            .select()
            .from(media)
            .where(and(eq(media.id, id), sql`${media.deleted_at} IS NULL`))
            .limit(1)
        return res
    }

    async softDelete(id: string): Promise<Media | undefined> {
        const [res] = await this.db
            .update(media)
            .set({
                deleted_at: new Date()
            })
            .where(eq(media.id, id))
            .returning()
        return res
    }

    async hardDelete(id: string): Promise<Media | undefined> {
        const [res] = await this.db
            .delete(media)
            .where(eq(media.id, id))
            .returning()
        return res
    }
}
