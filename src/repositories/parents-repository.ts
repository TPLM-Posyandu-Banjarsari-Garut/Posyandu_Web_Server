import { NewParent, Parent, parents } from '@/db'
import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ParentQueryFilters {
    search?: string
    user_id?: number
    blood_type?: Parent['blood_type']
    page?: number
    limit?: number
}

export class ParentRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_parent: NewParent): Promise<Parent> {
        const [parent] = await this.db
            .insert(parents)
            .values(new_parent)
            .returning()
        return parent
    }

    async findAll(): Promise<Parent[]> {
        return this.db.select().from(parents)
    }

    async getParents(filters?: ParentQueryFilters) {
        const {
            search,
            user_id,
            blood_type,
            page = 1,
            limit = 10
        } = filters || {}

        const whereClause = and(
            search
                ? or(
                      ilike(parents.identity_number, `%${search}%`),
                      ilike(parents.address_line, `%${search}%`)
                  )
                : undefined,
            user_id ? eq(parents.user_id, user_id) : undefined,
            blood_type ? eq(parents.blood_type, blood_type) : undefined
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(parents)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(parents)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<Parent | undefined> {
        const [parent] = await this.db
            .select()
            .from(parents)
            .where(eq(parents.public_id, public_id))
            .limit(1)
        return parent
    }

    async findByUserId(user_id: number): Promise<Parent | undefined> {
        const [parent] = await this.db
            .select()
            .from(parents)
            .where(eq(parents.user_id, user_id))
            .limit(1)
        return parent
    }

    async findByIdentityNumber(
        identity_number: string
    ): Promise<Parent | undefined> {
        const [parent] = await this.db
            .select()
            .from(parents)
            .where(eq(parents.identity_number, identity_number))
            .limit(1)
        return parent
    }

    async update(
        public_id: string,
        updated_parent: Partial<NewParent>
    ): Promise<Parent | undefined> {
        const [parent] = await this.db
            .update(parents)
            .set(updated_parent)
            .where(eq(parents.public_id, public_id))
            .returning()
        return parent
    }

    async delete(public_id: string): Promise<Parent | undefined> {
        const [parent] = await this.db
            .delete(parents)
            .where(eq(parents.public_id, public_id))
            .returning()
        return parent
    }

    async existsByIdentityNumber(identity_number: string): Promise<boolean> {
        const [parent] = await this.db
            .select({ id: parents.id })
            .from(parents)
            .where(eq(parents.identity_number, identity_number))
            .limit(1)
        return !!parent
    }
}
