import { NewNutritionRecord, NutritionRecord, nutritionRecords } from '@/db'
import { and, eq, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface NutritionRecordQueryFilters {
    children_id?: string
    cadre_id?: string
    midwife_id?: string
    nutrition_status?: NutritionRecord['nutrition_status']
    parent_id?: string
    posyandu_id?: string
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class NutritionRecordRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_record: NewNutritionRecord): Promise<NutritionRecord> {
        const [record] = await this.db
            .insert(nutritionRecords)
            .values(new_record)
            .returning()
        return record
    }

    async getNutritionRecords(filters?: NutritionRecordQueryFilters) {
        const {
            children_id,
            cadre_id,
            midwife_id,
            nutrition_status,
            parent_id,
            posyandu_id,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${nutritionRecords.deleted_at} IS NULL`)
        }

        if (children_id) {
            conditions.push(eq(nutritionRecords.children_id, children_id))
        }

        if (cadre_id) {
            conditions.push(eq(nutritionRecords.cadre_id, cadre_id))
        }

        if (midwife_id) {
            conditions.push(eq(nutritionRecords.midwife_id, midwife_id))
        }

        if (nutrition_status) {
            conditions.push(
                eq(nutritionRecords.nutrition_status, nutrition_status)
            )
        }

        if (parent_id) {
            conditions.push(
                sql`${nutritionRecords.children_id} IN (
                    SELECT children_id FROM relation_childrens WHERE parent_id = ${parent_id} AND deleted_at IS NULL
                )`
            )
        }

        if (posyandu_id) {
            conditions.push(
                sql`${nutritionRecords.children_id} IN (
                    SELECT id FROM childrens WHERE posyandu_id = ${posyandu_id} AND deleted_at IS NULL
                )`
            )
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(nutritionRecords),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(nutritionRecords)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(nutritionRecords.created_at)
                    : desc(nutritionRecords.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(nutritionRecords)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...record }) => record)

        return {
            data,
            totalItems
        }
    }

    async findById(public_id: string): Promise<NutritionRecord | undefined> {
        const [record] = await this.db
            .select()
            .from(nutritionRecords)
            .where(
                and(
                    eq(nutritionRecords.id, public_id),
                    sql`${nutritionRecords.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return record
    }

    async update(
        public_id: string,
        updated_record: Partial<NewNutritionRecord>
    ): Promise<NutritionRecord | undefined> {
        const [record] = await this.db
            .update(nutritionRecords)
            .set(updated_record)
            .where(eq(nutritionRecords.id, public_id))
            .returning()
        return record
    }

    async softDelete(public_id: string): Promise<NutritionRecord | undefined> {
        const [record] = await this.db
            .update(nutritionRecords)
            .set({
                deleted_at: new Date()
            })
            .where(eq(nutritionRecords.id, public_id))
            .returning()
        return record
    }

    async hardDelete(public_id: string): Promise<NutritionRecord | undefined> {
        const [record] = await this.db
            .delete(nutritionRecords)
            .where(eq(nutritionRecords.id, public_id))
            .returning()
        return record
    }

    async restore(public_id: string): Promise<NutritionRecord | undefined> {
        const [record] = await this.db
            .update(nutritionRecords)
            .set({
                deleted_at: null
            })
            .where(eq(nutritionRecords.id, public_id))
            .returning()
        return record
    }
}
