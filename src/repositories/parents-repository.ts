import { NewParent, Parent, parents, relationChildrens } from '@/db'
import { and, eq, ilike, or, sql, SQL, asc, desc } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ParentQueryFilters {
    search?: string
    user_id?: string
    blood_type?: Parent['blood_type']
    status?: Parent['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
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
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(parents.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(parents.status, 'active')
        }

        const whereClause = and(
            search
                ? or(
                      ilike(parents.identity_number, `%${search}%`),
                      ilike(parents.address_line, `%${search}%`)
                  )
                : undefined,
            user_id ? eq(parents.user_id, user_id) : undefined,
            blood_type ? eq(parents.blood_type, blood_type) : undefined,
            statusCondition
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(parents)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(parents.created_at)
                        : desc(parents.created_at)
                )
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
        return this.findByCondition(
            and(eq(parents.id, public_id), eq(parents.status, 'active'))
        )
    }

    async findByUserId(user_id: string): Promise<Parent | undefined> {
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
            .where(eq(parents.id, public_id))
            .returning()
        return parent
    }
    private async findByCondition(
        condition: SQL | undefined
    ): Promise<Parent | undefined> {
        const [row] = await this.db
            .select()
            .from(parents)
            .where(condition)
            .limit(1)
        return row
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<Parent | undefined> {
        const [row] = await this.db
            .update(parents)
            .set({ status })
            .where(eq(parents.id, public_id))
            .returning()
        return row
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: parents.id })
            .from(parents)
            .where(condition)
            .limit(1)
        return !!row
    }

    async softDelete(public_id: string): Promise<Parent | undefined> {
        return this.updateStatus(public_id, 'inactive')
    }

    async hardDelete(public_id: string): Promise<Parent | undefined> {
        const [parent] = await this.db
            .delete(parents)
            .where(eq(parents.id, public_id))
            .returning()
        return parent
    }

    async restore(public_id: string): Promise<Parent | undefined> {
        return this.updateStatus(public_id, 'active')
    }

    async existsByIdentityNumber(identity_number: string): Promise<boolean> {
        const [parent] = await this.db
            .select({ id: parents.id })
            .from(parents)
            .where(eq(parents.identity_number, identity_number))
            .limit(1)
        return !!parent
    }

    async isChildAssociatedWithParent(
        parent_id: string,
        children_id: string
    ): Promise<boolean> {
        const [relation] = await this.db
            .select({ id: relationChildrens.id })
            .from(relationChildrens)
            .where(
                and(
                    eq(relationChildrens.parent_id, parent_id),
                    eq(relationChildrens.children_id, children_id)
                )
            )
            .limit(1)
        return !!relation
    }
}
