import { NewKipiDetail, KipiDetail, kipiDetails } from '@/db'
import { and, eq, sql, asc, desc, getTableColumns } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface KipiDetailQueryFilters {
    immunization_record_id?: string
    severity?: KipiDetail['severity']
    referred?: boolean
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class KipiDetailRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_kipi: NewKipiDetail): Promise<KipiDetail> {
        const [kipi] = await this.db
            .insert(kipiDetails)
            .values(new_kipi)
            .returning()
        return kipi
    }

    async getKipiDetails(filters?: KipiDetailQueryFilters) {
        const {
            immunization_record_id,
            severity,
            referred,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${kipiDetails.deleted_at} IS NULL`)
        }

        if (immunization_record_id) {
            conditions.push(
                eq(kipiDetails.immunization_record_id, immunization_record_id)
            )
        }

        if (severity) {
            conditions.push(eq(kipiDetails.severity, severity))
        }

        if (referred !== undefined) {
            conditions.push(eq(kipiDetails.referred, referred))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(kipiDetails),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(kipiDetails)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(kipiDetails.created_at)
                    : desc(kipiDetails.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(kipiDetails)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(({ total_count, ...kipi }) => kipi)

        return {
            data,
            totalItems
        }
    }

    async findById(public_id: string): Promise<KipiDetail | undefined> {
        const [kipi] = await this.db
            .select()
            .from(kipiDetails)
            .where(
                and(
                    eq(kipiDetails.id, public_id),
                    sql`${kipiDetails.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return kipi
    }

    async findByImmunizationRecordId(
        immunization_record_id: string
    ): Promise<KipiDetail | undefined> {
        const [kipi] = await this.db
            .select()
            .from(kipiDetails)
            .where(
                and(
                    eq(
                        kipiDetails.immunization_record_id,
                        immunization_record_id
                    ),
                    sql`${kipiDetails.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return kipi
    }

    async update(
        public_id: string,
        updated_kipi: Partial<NewKipiDetail>
    ): Promise<KipiDetail | undefined> {
        const [kipi] = await this.db
            .update(kipiDetails)
            .set(updated_kipi)
            .where(eq(kipiDetails.id, public_id))
            .returning()
        return kipi
    }

    async softDelete(public_id: string): Promise<KipiDetail | undefined> {
        const [kipi] = await this.db
            .update(kipiDetails)
            .set({
                deleted_at: new Date()
            })
            .where(eq(kipiDetails.id, public_id))
            .returning()
        return kipi
    }

    async hardDelete(public_id: string): Promise<KipiDetail | undefined> {
        const [kipi] = await this.db
            .delete(kipiDetails)
            .where(eq(kipiDetails.id, public_id))
            .returning()
        return kipi
    }

    async restore(public_id: string): Promise<KipiDetail | undefined> {
        const [kipi] = await this.db
            .update(kipiDetails)
            .set({
                deleted_at: null
            })
            .where(eq(kipiDetails.id, public_id))
            .returning()
        return kipi
    }

    async existsByImmunizationRecordId(
        immunization_record_id: string
    ): Promise<boolean> {
        const [kipi] = await this.db
            .select({ id: kipiDetails.id })
            .from(kipiDetails)
            .where(
                eq(kipiDetails.immunization_record_id, immunization_record_id)
            )
            .limit(1)
        return !!kipi
    }
}
