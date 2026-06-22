import {
    NewExaminationSchedule,
    ExaminationSchedule,
    examinationSchedules
} from '@/db'
import { and, eq, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ExaminationSchedulesQueryFilters {
    posyandu_id?: string
    examination_id?: string
    midwife_id?: string
    cadre_id?: string
    status?: ExaminationSchedule['status']
    scheduled_date?: string | Date
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class ExaminationSchedulesRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(
        new_schedule: NewExaminationSchedule
    ): Promise<ExaminationSchedule> {
        const [record] = await this.db
            .insert(examinationSchedules)
            .values(new_schedule)
            .returning()
        return record
    }

    async getSchedules(filters?: ExaminationSchedulesQueryFilters) {
        const {
            posyandu_id,
            examination_id,
            midwife_id,
            cadre_id,
            status,
            scheduled_date,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${examinationSchedules.deleted_at} IS NULL`)
        }

        if (posyandu_id) {
            conditions.push(eq(examinationSchedules.posyandu_id, posyandu_id))
        }

        if (examination_id) {
            conditions.push(
                eq(examinationSchedules.examination_id, examination_id)
            )
        }

        if (midwife_id) {
            conditions.push(eq(examinationSchedules.midwife_id, midwife_id))
        }

        if (cadre_id) {
            conditions.push(eq(examinationSchedules.cadre_id, cadre_id))
        }

        if (status) {
            conditions.push(eq(examinationSchedules.status, status))
        }

        if (scheduled_date) {
            const dateVal =
                typeof scheduled_date === 'string'
                    ? new Date(scheduled_date)
                    : scheduled_date
            conditions.push(eq(examinationSchedules.scheduled_date, dateVal))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(examinationSchedules),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(examinationSchedules)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(examinationSchedules.created_at)
                    : desc(examinationSchedules.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(examinationSchedules)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...record }) => record)

        return {
            data,
            totalItems
        }
    }

    async findById(id: string): Promise<ExaminationSchedule | undefined> {
        const [record] = await this.db
            .select()
            .from(examinationSchedules)
            .where(
                and(
                    eq(examinationSchedules.id, id),
                    sql`${examinationSchedules.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return record
    }

    async update(
        id: string,
        updated_schedule: Partial<NewExaminationSchedule>
    ): Promise<ExaminationSchedule | undefined> {
        const [record] = await this.db
            .update(examinationSchedules)
            .set(updated_schedule)
            .where(eq(examinationSchedules.id, id))
            .returning()
        return record
    }

    async softDelete(id: string): Promise<ExaminationSchedule | undefined> {
        const [record] = await this.db
            .update(examinationSchedules)
            .set({
                deleted_at: new Date()
            })
            .where(eq(examinationSchedules.id, id))
            .returning()
        return record
    }

    async hardDelete(id: string): Promise<ExaminationSchedule | undefined> {
        const [record] = await this.db
            .delete(examinationSchedules)
            .where(eq(examinationSchedules.id, id))
            .returning()
        return record
    }

    async restore(id: string): Promise<ExaminationSchedule | undefined> {
        const [record] = await this.db
            .update(examinationSchedules)
            .set({
                deleted_at: null
            })
            .where(eq(examinationSchedules.id, id))
            .returning()
        return record
    }

    async incrementParticipants(
        id: string
    ): Promise<ExaminationSchedule | undefined> {
        const [record] = await this.db
            .update(examinationSchedules)
            .set({
                current_participants: sql`${examinationSchedules.current_participants} + 1`
            })
            .where(eq(examinationSchedules.id, id))
            .returning()
        return record
    }

    async decrementParticipants(
        id: string
    ): Promise<ExaminationSchedule | undefined> {
        const [record] = await this.db
            .update(examinationSchedules)
            .set({
                current_participants: sql`GREATEST(0, ${examinationSchedules.current_participants} - 1)`
            })
            .where(eq(examinationSchedules.id, id))
            .returning()
        return record
    }
}
