import { NewChildren, Children, childrens, relationChildrens } from '@/db'
import { and, eq, ilike, sql, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ChildrenQueryFilters {
    search?: string
    posyandu_id?: number
    parent_id?: number
    gender?: Children['gender']
    child_category?: Children['child_category']
    page?: number
    limit?: number
    includeDeleted?: boolean
}

export class ChildrenRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_children: NewChildren): Promise<Children> {
        const [child] = await this.db
            .insert(childrens)
            .values(new_children)
            .returning()
        return child
    }

    async getChildrens(filters?: ChildrenQueryFilters) {
        const {
            search,
            posyandu_id,
            parent_id,
            gender,
            child_category,
            page = 1,
            limit = 10,
            includeDeleted = false
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${childrens.deleted_at} IS NULL`)
        }

        if (search) {
            conditions.push(ilike(childrens.name, `%${search}%`))
        }

        if (posyandu_id) {
            conditions.push(eq(childrens.posyandu_id, posyandu_id))
        }

        if (gender) {
            conditions.push(eq(childrens.gender, gender))
        }

        if (child_category) {
            conditions.push(eq(childrens.child_category, child_category))
        }

        if (parent_id) {
            const parentChildSubquery = this.db
                .select({ children_id: relationChildrens.children_id })
                .from(relationChildrens)
                .where(eq(relationChildrens.parent_id, parent_id))

            conditions.push(inArray(childrens.id, parentChildSubquery))
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(childrens)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(childrens)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<Children | undefined> {
        const [child] = await this.db
            .select()
            .from(childrens)
            .where(
                and(
                    eq(childrens.public_id, public_id),
                    sql`${childrens.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return child
    }

    async findByIdentityNumber(
        identity_number: string
    ): Promise<Children | undefined> {
        const [child] = await this.db
            .select()
            .from(childrens)
            .where(
                and(
                    eq(childrens.identity_number, identity_number),
                    sql`${childrens.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return child
    }

    async findByParentId(parent_id: number): Promise<Children[]> {
        const records = await this.db
            .select({
                id: childrens.id,
                public_id: childrens.public_id,
                posyandu_id: childrens.posyandu_id,
                name: childrens.name,
                identity_number: childrens.identity_number,
                gender: childrens.gender,
                child_category: childrens.child_category,
                place_of_birth: childrens.place_of_birth,
                birth_date: childrens.birth_date,
                birth_order: childrens.birth_order,
                blood_type: childrens.blood_type,
                birth_weight: childrens.birth_weight,
                birth_length: childrens.birth_length,
                birth_head_circumference: childrens.birth_head_circumference,
                created_at: childrens.created_at,
                updated_at: childrens.updated_at,
                deleted_at: childrens.deleted_at
            })
            .from(childrens)
            .innerJoin(
                relationChildrens,
                eq(childrens.id, relationChildrens.children_id)
            )
            .where(
                and(
                    eq(relationChildrens.parent_id, parent_id),
                    sql`${childrens.deleted_at} IS NULL`
                )
            )

        return records
    }

    async update(
        public_id: string,
        updated_children: Partial<NewChildren>
    ): Promise<Children | undefined> {
        const [child] = await this.db
            .update(childrens)
            .set(updated_children)
            .where(eq(childrens.public_id, public_id))
            .returning()
        return child
    }

    async softDelete(public_id: string): Promise<Children | undefined> {
        const [child] = await this.db
            .update(childrens)
            .set({
                deleted_at: new Date()
            })
            .where(eq(childrens.public_id, public_id))
            .returning()
        return child
    }

    async hardDelete(public_id: string): Promise<Children | undefined> {
        const [child] = await this.db
            .delete(childrens)
            .where(eq(childrens.public_id, public_id))
            .returning()
        return child
    }

    async restore(public_id: string): Promise<Children | undefined> {
        const [child] = await this.db
            .update(childrens)
            .set({
                deleted_at: null
            })
            .where(eq(childrens.public_id, public_id))
            .returning()
        return child
    }

    async existsByIdentityNumber(identity_number: string): Promise<boolean> {
        const [child] = await this.db
            .select({ id: childrens.id })
            .from(childrens)
            .where(eq(childrens.identity_number, identity_number))
            .limit(1)
        return !!child
    }
}
