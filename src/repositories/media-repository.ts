import { NewMedia, Media, media } from '@/db'
import { and, eq, ilike, sql, asc, desc } from 'drizzle-orm'
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

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${media.deleted_at} IS NULL`)
        }

        if (uploaded_by) {
            conditions.push(eq(media.uploaded_by, uploaded_by))
        }

        if (search) {
            conditions.push(ilike(media.original_name, `%${search}%`))
        }

        if (file_category) {
            conditions.push(eq(media.file_category, file_category))
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(media)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(media.created_at)
                        : desc(media.created_at)
                )
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(media)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
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
