import { NewPregnancyRecord, PregnancyRecord, pregnancyRecords } from '@/db'
import { and, eq, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface PregnancyRecordQueryFilters {
    search?: string
    parent_id?: string
    posyandu_id?: string
    pregnancy_status?: PregnancyRecord['pregnancy_status']
    risk_level?: PregnancyRecord['risk_level']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class PregnancyRecordsRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_record: NewPregnancyRecord): Promise<PregnancyRecord> {
        const [record] = await this.db
            .insert(pregnancyRecords)
            .values(new_record)
            .returning()
        return record
    }

    async getPregnancyRecords(filters?: PregnancyRecordQueryFilters) {
        const {
            parent_id,
            posyandu_id,
            pregnancy_status,
            risk_level,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${pregnancyRecords.deleted_at} IS NULL`)
        }

        if (parent_id) {
            conditions.push(eq(pregnancyRecords.parent_id, parent_id))
        }

        if (posyandu_id) {
            conditions.push(eq(pregnancyRecords.posyandu_id, posyandu_id))
        }

        if (pregnancy_status) {
            conditions.push(
                eq(pregnancyRecords.pregnancy_status, pregnancy_status)
            )
        }

        if (risk_level) {
            conditions.push(eq(pregnancyRecords.risk_level, risk_level))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(pregnancyRecords),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(pregnancyRecords)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(pregnancyRecords.created_at)
                    : desc(pregnancyRecords.created_at)
            )
            .limit(limit)
            .offset((page - 1) * limit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(pregnancyRecords)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...record }) => record)

        return {
            data,
            totalItems
        }
    }

    async findById(id: string): Promise<PregnancyRecord | undefined> {
        const [record] = await this.db
            .select()
            .from(pregnancyRecords)
            .where(
                and(
                    eq(pregnancyRecords.id, id),
                    sql`${pregnancyRecords.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return record
    }

    async update(
        id: string,
        updated_record: Partial<NewPregnancyRecord>
    ): Promise<PregnancyRecord | undefined> {
        const [record] = await this.db
            .update(pregnancyRecords)
            .set(updated_record)
            .where(eq(pregnancyRecords.id, id))
            .returning()
        return record
    }

    async softDelete(id: string): Promise<PregnancyRecord | undefined> {
        const [record] = await this.db
            .update(pregnancyRecords)
            .set({
                deleted_at: new Date()
            })
            .where(eq(pregnancyRecords.id, id))
            .returning()
        return record
    }

    async hardDelete(id: string): Promise<PregnancyRecord | undefined> {
        const [record] = await this.db
            .delete(pregnancyRecords)
            .where(eq(pregnancyRecords.id, id))
            .returning()
        return record
    }

    async restore(id: string): Promise<PregnancyRecord | undefined> {
        const [record] = await this.db
            .update(pregnancyRecords)
            .set({
                deleted_at: null
            })
            .where(eq(pregnancyRecords.id, id))
            .returning()
        return record
    }
}
