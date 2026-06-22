import {
    NewExaminationRecord,
    ExaminationRecord,
    examinationRecords
} from '@/db'
import { and, eq, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ExaminationRecordsQueryFilters {
    examination_id?: string
    schedule_id?: string
    posyandu_id?: string
    children_id?: string
    parent_id?: string
    cadre_id?: string
    midwife_id?: string
    status?: ExaminationRecord['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class ExaminationRecordsRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_record: NewExaminationRecord): Promise<ExaminationRecord> {
        const [record] = await this.db
            .insert(examinationRecords)
            .values(new_record)
            .returning()
        return record
    }

    async getRecords(filters?: ExaminationRecordsQueryFilters) {
        const {
            examination_id,
            schedule_id,
            posyandu_id,
            children_id,
            parent_id,
            cadre_id,
            midwife_id,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${examinationRecords.deleted_at} IS NULL`)
        }

        if (examination_id) {
            conditions.push(
                eq(examinationRecords.examination_id, examination_id)
            )
        }

        if (schedule_id) {
            conditions.push(eq(examinationRecords.schedule_id, schedule_id))
        }

        if (posyandu_id) {
            conditions.push(eq(examinationRecords.posyandu_id, posyandu_id))
        }

        if (children_id) {
            conditions.push(eq(examinationRecords.children_id, children_id))
        }

        if (parent_id) {
            conditions.push(eq(examinationRecords.parent_id, parent_id))
        }

        if (cadre_id) {
            conditions.push(eq(examinationRecords.cadre_id, cadre_id))
        }

        if (midwife_id) {
            conditions.push(eq(examinationRecords.midwife_id, midwife_id))
        }

        if (status) {
            conditions.push(eq(examinationRecords.status, status))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(examinationRecords),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(examinationRecords)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(examinationRecords.created_at)
                    : desc(examinationRecords.created_at)
            )
            .limit(limit)
            .offset((page - 1) * limit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(examinationRecords)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...record }) => record)

        return {
            data,
            totalItems
        }
    }

    async findById(id: string): Promise<ExaminationRecord | undefined> {
        const [record] = await this.db
            .select()
            .from(examinationRecords)
            .where(
                and(
                    eq(examinationRecords.id, id),
                    sql`${examinationRecords.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return record
    }

    async update(
        id: string,
        updated_record: Partial<NewExaminationRecord>
    ): Promise<ExaminationRecord | undefined> {
        const [record] = await this.db
            .update(examinationRecords)
            .set(updated_record)
            .where(eq(examinationRecords.id, id))
            .returning()
        return record
    }

    async softDelete(id: string): Promise<ExaminationRecord | undefined> {
        const [record] = await this.db
            .update(examinationRecords)
            .set({
                deleted_at: new Date()
            })
            .where(eq(examinationRecords.id, id))
            .returning()
        return record
    }

    async hardDelete(id: string): Promise<ExaminationRecord | undefined> {
        const [record] = await this.db
            .delete(examinationRecords)
            .where(eq(examinationRecords.id, id))
            .returning()
        return record
    }

    async restore(id: string): Promise<ExaminationRecord | undefined> {
        const [record] = await this.db
            .update(examinationRecords)
            .set({
                deleted_at: null
            })
            .where(eq(examinationRecords.id, id))
            .returning()
        return record
    }
}
