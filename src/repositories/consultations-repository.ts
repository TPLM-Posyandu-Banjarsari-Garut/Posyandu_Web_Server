import { NewConsultation, Consultation, consultations } from '@/db'
import {
    and,
    eq,
    ilike,
    sql,
    SQL,
    asc,
    desc,
    getTableColumns
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ConsultationsQueryFilters {
    search?: string
    parent_id?: string
    children_id?: string
    pregnancy_record_id?: string
    midwife_id?: string
    cadre_id?: string
    posyandu_id?: string
    status?: Consultation['status']
    consultation_type?: Consultation['consultation_type']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class ConsultationsRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_consultation: NewConsultation): Promise<Consultation> {
        const [consultation] = await this.db
            .insert(consultations)
            .values(new_consultation)
            .returning()
        return consultation
    }

    async getConsultations(filters?: ConsultationsQueryFilters) {
        const {
            search,
            parent_id,
            children_id,
            pregnancy_record_id,
            midwife_id,
            cadre_id,
            posyandu_id,
            status,
            consultation_type,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const conditions: (SQL | undefined)[] = []

        if (!includeDeleted) {
            conditions.push(sql`${consultations.deleted_at} IS NULL`)
        }

        if (parent_id) {
            conditions.push(eq(consultations.parent_id, parent_id))
        }

        if (children_id) {
            conditions.push(eq(consultations.children_id, children_id))
        }

        if (pregnancy_record_id) {
            conditions.push(
                eq(consultations.pregnancy_record_id, pregnancy_record_id)
            )
        }

        if (midwife_id) {
            conditions.push(eq(consultations.midwife_id, midwife_id))
        }

        if (cadre_id) {
            conditions.push(eq(consultations.cadre_id, cadre_id))
        }

        if (posyandu_id) {
            conditions.push(eq(consultations.posyandu_id, posyandu_id))
        }

        if (status) {
            conditions.push(eq(consultations.status, status))
        }

        if (consultation_type) {
            conditions.push(
                eq(consultations.consultation_type, consultation_type)
            )
        }

        if (search) {
            conditions.push(ilike(consultations.notes, `%${search}%`))
        }

        const whereClause = and(...conditions)

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(consultations),
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(consultations)
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(consultations.created_at)
                    : desc(consultations.created_at)
            )
            .limit(limit)
            .offset((page - 1) * limit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(consultations)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        const data = dataWithCount.map(
            ({ total_count, ...consultation }) => consultation
        )

        return {
            data,
            totalItems
        }
    }

    async findById(public_id: string): Promise<Consultation | undefined> {
        const [consultation] = await this.db
            .select()
            .from(consultations)
            .where(
                and(
                    eq(consultations.id, public_id),
                    sql`${consultations.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return consultation
    }

    async update(
        public_id: string,
        updated_consultation: Partial<NewConsultation>
    ): Promise<Consultation | undefined> {
        const [consultation] = await this.db
            .update(consultations)
            .set(updated_consultation)
            .where(eq(consultations.id, public_id))
            .returning()
        return consultation
    }

    async softDelete(public_id: string): Promise<Consultation | undefined> {
        const [consultation] = await this.db
            .update(consultations)
            .set({ deleted_at: new Date() })
            .where(eq(consultations.id, public_id))
            .returning()
        return consultation
    }

    async hardDelete(public_id: string): Promise<Consultation | undefined> {
        const [consultation] = await this.db
            .delete(consultations)
            .where(eq(consultations.id, public_id))
            .returning()
        return consultation
    }

    async restore(public_id: string): Promise<Consultation | undefined> {
        const [consultation] = await this.db
            .update(consultations)
            .set({ deleted_at: null })
            .where(eq(consultations.id, public_id))
            .returning()
        return consultation
    }
}
