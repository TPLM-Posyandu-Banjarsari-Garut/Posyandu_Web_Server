import {
    NewImmunizationRecord,
    ImmunizationRecord,
    immunizationRecords,
    parents,
    relationChildrens
} from '@/db'
import { and, eq, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ImmunizationRecordQueryFilters {
    children_id?: string
    vaccine_id?: string
    posyandu_id?: string
    cadre_id?: string
    midwife_id?: string
    parent_user_id?: string
    status?: ImmunizationRecord['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class ImmunizationRecordRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(
        new_record: NewImmunizationRecord
    ): Promise<ImmunizationRecord> {
        const [record] = await this.db
            .insert(immunizationRecords)
            .values(new_record)
            .returning()
        return record
    }

    async getImmunizationRecords(filters?: ImmunizationRecordQueryFilters) {
        const {
            children_id,
            vaccine_id,
            posyandu_id,
            cadre_id,
            midwife_id,
            parent_user_id,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${immunizationRecords.deleted_at} IS NULL`)
        }

        if (children_id) {
            conditions.push(eq(immunizationRecords.children_id, children_id))
        }

        if (vaccine_id) {
            conditions.push(eq(immunizationRecords.vaccine_id, vaccine_id))
        }

        if (posyandu_id) {
            conditions.push(eq(immunizationRecords.posyandu_id, posyandu_id))
        }

        if (cadre_id) {
            conditions.push(eq(immunizationRecords.cadre_id, cadre_id))
        }

        if (midwife_id) {
            conditions.push(eq(immunizationRecords.midwife_id, midwife_id))
        }

        if (parent_user_id) {
            const parentChildrenSubquery = this.db
                .select({ id: relationChildrens.children_id })
                .from(relationChildrens)
                .innerJoin(parents, eq(relationChildrens.parent_id, parents.id))
                .where(eq(parents.user_id, parent_user_id))

            conditions.push(
                sql`${immunizationRecords.children_id} IN (${parentChildrenSubquery})`
            )
        }

        if (status) {
            conditions.push(eq(immunizationRecords.status, status))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(immunizationRecords),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(immunizationRecords)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(immunizationRecords.created_at)
                    : desc(immunizationRecords.created_at)
            )
            .limit(limit)
            .offset((page - 1) * limit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(immunizationRecords)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...record }) => record)

        return {
            data,
            totalItems
        }
    }

    async findById(public_id: string): Promise<ImmunizationRecord | undefined> {
        const [record] = await this.db
            .select()
            .from(immunizationRecords)
            .where(
                and(
                    eq(immunizationRecords.id, public_id),
                    sql`${immunizationRecords.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return record
    }

    async update(
        public_id: string,
        updated_record: Partial<NewImmunizationRecord>
    ): Promise<ImmunizationRecord | undefined> {
        const [record] = await this.db
            .update(immunizationRecords)
            .set(updated_record)
            .where(eq(immunizationRecords.id, public_id))
            .returning()
        return record
    }

    async softDelete(
        public_id: string
    ): Promise<ImmunizationRecord | undefined> {
        const [record] = await this.db
            .update(immunizationRecords)
            .set({
                deleted_at: new Date()
            })
            .where(eq(immunizationRecords.id, public_id))
            .returning()
        return record
    }

    async hardDelete(
        public_id: string
    ): Promise<ImmunizationRecord | undefined> {
        const [record] = await this.db
            .delete(immunizationRecords)
            .where(eq(immunizationRecords.id, public_id))
            .returning()
        return record
    }

    async restore(public_id: string): Promise<ImmunizationRecord | undefined> {
        const [record] = await this.db
            .update(immunizationRecords)
            .set({
                deleted_at: null
            })
            .where(eq(immunizationRecords.id, public_id))
            .returning()
        return record
    }

    async existsByUniqueKey(
        children_id: string,
        vaccine_id: string,
        dose_number: number
    ): Promise<boolean> {
        const [record] = await this.db
            .select({ id: immunizationRecords.id })
            .from(immunizationRecords)
            .where(
                and(
                    eq(immunizationRecords.children_id, children_id),
                    eq(immunizationRecords.vaccine_id, vaccine_id),
                    eq(immunizationRecords.dose_number, dose_number)
                )
            )
            .limit(1)
        return !!record
    }

    async isChildAssociatedWithParentUser(
        parent_user_id: string,
        children_id: string
    ): Promise<boolean> {
        const [relation] = await this.db
            .select({ id: relationChildrens.id })
            .from(relationChildrens)
            .innerJoin(parents, eq(relationChildrens.parent_id, parents.id))
            .where(
                and(
                    eq(parents.user_id, parent_user_id),
                    eq(relationChildrens.children_id, children_id)
                )
            )
            .limit(1)
        return !!relation
    }
}
