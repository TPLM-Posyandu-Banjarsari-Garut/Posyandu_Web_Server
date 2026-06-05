import { NewMidwife, Midwife, midwifes } from '@/db'
import { and, eq, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface MidwifeQueryFilters {
    user_id?: number
    posyandu_id?: number
    license_number?: string
    page?: number
    limit?: number
}

export class MidwifeRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_midwife: NewMidwife): Promise<Midwife> {
        const [midwife] = await this.db
            .insert(midwifes)
            .values(new_midwife)
            .returning()
        return midwife
    }

    async findAll(): Promise<Midwife[]> {
        return this.db.select().from(midwifes)
    }

    async getMidwifes(filters?: MidwifeQueryFilters) {
        const {
            user_id,
            posyandu_id,
            license_number,
            page = 1,
            limit = 10
        } = filters || {}

        const whereClause = and(
            user_id ? eq(midwifes.user_id, user_id) : undefined,
            posyandu_id ? eq(midwifes.posyandu_id, posyandu_id) : undefined,
            license_number
                ? eq(midwifes.license_number, license_number)
                : undefined
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(midwifes)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(midwifes)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .select()
            .from(midwifes)
            .where(eq(midwifes.public_id, public_id))
            .limit(1)
        return midwife
    }

    async findByUserId(user_id: number): Promise<Midwife[]> {
        return this.db
            .select()
            .from(midwifes)
            .where(eq(midwifes.user_id, user_id))
    }

    async findByPosyanduId(posyandu_id: number): Promise<Midwife[]> {
        return this.db
            .select()
            .from(midwifes)
            .where(eq(midwifes.posyandu_id, posyandu_id))
    }

    async update(
        public_id: string,
        updated_midwife: Partial<NewMidwife>
    ): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .update(midwifes)
            .set(updated_midwife)
            .where(eq(midwifes.public_id, public_id))
            .returning()
        return midwife
    }

    async delete(public_id: string): Promise<Midwife | undefined> {
        const [midwife] = await this.db
            .delete(midwifes)
            .where(eq(midwifes.public_id, public_id))
            .returning()
        return midwife
    }

    async existsByLicenseNumber(license_number: string): Promise<boolean> {
        const [midwife] = await this.db
            .select({ id: midwifes.id })
            .from(midwifes)
            .where(eq(midwifes.license_number, license_number))
            .limit(1)
        return !!midwife
    }
}
