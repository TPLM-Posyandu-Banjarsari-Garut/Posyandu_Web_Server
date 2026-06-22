import { NewVitaminRecord, VitaminRecord, vitaminRecords } from '@/db'
import { and, eq, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface VitaminRecordQueryFilters {
    children_id?: string
    vitamin_id?: string
    posyandu_id?: string
    cadre_id?: string
    midwife_id?: string
    status?: VitaminRecord['status']
    distribution_period?: VitaminRecord['distribution_period']
    distribution_year?: number
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class VitaminRecordRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_record: NewVitaminRecord): Promise<VitaminRecord> {
        const [record] = await this.db
            .insert(vitaminRecords)
            .values(new_record)
            .returning()
        return record
    }

    async getVitaminRecords(filters?: VitaminRecordQueryFilters) {
        const {
            children_id,
            vitamin_id,
            posyandu_id,
            cadre_id,
            midwife_id,
            status,
            distribution_period,
            distribution_year,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${vitaminRecords.deleted_at} IS NULL`)
        }

        if (children_id) {
            conditions.push(eq(vitaminRecords.children_id, children_id))
        }

        if (vitamin_id) {
            conditions.push(eq(vitaminRecords.vitamin_id, vitamin_id))
        }

        if (posyandu_id) {
            conditions.push(eq(vitaminRecords.posyandu_id, posyandu_id))
        }

        if (cadre_id) {
            conditions.push(eq(vitaminRecords.cadre_id, cadre_id))
        }

        if (midwife_id) {
            conditions.push(eq(vitaminRecords.midwife_id, midwife_id))
        }

        if (status) {
            conditions.push(eq(vitaminRecords.status, status))
        }

        if (distribution_period) {
            conditions.push(
                eq(vitaminRecords.distribution_period, distribution_period)
            )
        }

        if (distribution_year !== undefined) {
            conditions.push(
                eq(vitaminRecords.distribution_year, distribution_year)
            )
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(vitaminRecords),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(vitaminRecords)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(vitaminRecords.created_at)
                    : desc(vitaminRecords.created_at)
            )
            .limit(limit)
            .offset((page - 1) * limit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(vitaminRecords)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...record }) => record)

        return {
            data,
            totalItems
        }
    }

    async findById(public_id: string): Promise<VitaminRecord | undefined> {
        const [record] = await this.db
            .select()
            .from(vitaminRecords)
            .where(
                and(
                    eq(vitaminRecords.id, public_id),
                    sql`${vitaminRecords.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return record
    }

    async update(
        public_id: string,
        updated_record: Partial<NewVitaminRecord>
    ): Promise<VitaminRecord | undefined> {
        const [record] = await this.db
            .update(vitaminRecords)
            .set(updated_record)
            .where(eq(vitaminRecords.id, public_id))
            .returning()
        return record
    }

    async softDelete(public_id: string): Promise<VitaminRecord | undefined> {
        const [record] = await this.db
            .update(vitaminRecords)
            .set({
                deleted_at: new Date()
            })
            .where(eq(vitaminRecords.id, public_id))
            .returning()
        return record
    }

    async hardDelete(public_id: string): Promise<VitaminRecord | undefined> {
        const [record] = await this.db
            .delete(vitaminRecords)
            .where(eq(vitaminRecords.id, public_id))
            .returning()
        return record
    }

    async restore(public_id: string): Promise<VitaminRecord | undefined> {
        const [record] = await this.db
            .update(vitaminRecords)
            .set({
                deleted_at: null
            })
            .where(eq(vitaminRecords.id, public_id))
            .returning()
        return record
    }

    async existsByUniqueKey(
        children_id: string,
        distribution_period: VitaminRecord['distribution_period'],
        distribution_year: number
    ): Promise<boolean> {
        const [record] = await this.db
            .select({ id: vitaminRecords.id })
            .from(vitaminRecords)
            .where(
                and(
                    eq(vitaminRecords.children_id, children_id),
                    eq(vitaminRecords.distribution_period, distribution_period),
                    eq(vitaminRecords.distribution_year, distribution_year)
                )
            )
            .limit(1)
        return !!record
    }
}
