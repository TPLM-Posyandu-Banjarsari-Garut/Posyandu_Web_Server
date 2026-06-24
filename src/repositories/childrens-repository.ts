import {
    NewChildren,
    Children,
    childrens,
    relationChildrens,
    parents,
    users,
    posyandus,
    nutritionRecords,
    vitaminRecords
} from '@/db'
import { BaseRepository } from '@/repositories/base-repository'
import { sanitizeSearchTerm } from '@/utils/sanitize'
import {
    and,
    eq,
    ilike,
    sql,
    inArray,
    asc,
    desc,
    getTableColumns
} from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ChildrenQueryFilters {
    search?: string
    posyandu_id?: string
    parent_id?: string
    gender?: Children['gender']
    child_category?: Children['child_category']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class ChildrenRepository extends BaseRepository<
    typeof childrens,
    Children,
    NewChildren
> {
    constructor(db: NodePgDatabase<Record<string, never>>) {
        super(db, childrens)
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
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const escapedSearch = search ? sanitizeSearchTerm(search) : undefined

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${childrens.deleted_at} IS NULL`)
        }

        if (escapedSearch) {
            conditions.push(ilike(childrens.name, `%${escapedSearch}%`))
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

        const dataWithCount = await this.db
            .select({
                child: childrens,
                posyandu: posyandus,
                mother_name: users.name,
                parent_user_id: parents.user_id,
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(childrens)
            .leftJoin(posyandus, eq(posyandus.id, childrens.posyandu_id))
            .leftJoin(
                relationChildrens,
                and(
                    eq(relationChildrens.children_id, childrens.id),
                    eq(relationChildrens.relation, 'mother')
                )
            )
            .leftJoin(parents, eq(parents.id, relationChildrens.parent_id))
            .leftJoin(users, eq(users.id, parents.user_id))
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(childrens.created_at)
                    : desc(childrens.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        let totalItems = 0
        if (dataWithCount.length > 0) {
            totalItems = dataWithCount[0].total_count
        } else {
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(childrens)
                .where(whereClause)
            totalItems = Number(countResult[0]?.count || 0)
        }

        if (dataWithCount.length === 0) {
            return {
                data: [],
                totalItems
            }
        }

        const enrichedData = dataWithCount.map(row => ({
            ...row.child,
            posyandu_detail: row.posyandu || null,
            mother_name: row.mother_name || null
        }))

        return {
            data: enrichedData,
            totalItems
        }
    }

    async findByIdWithEnrichment(
        public_id: string,
        includeDeleted = false
    ): Promise<
        | (Children & {
              mother_name?: string | null
              parent_user_id?: string | null
              posyandu_detail?: typeof posyandus.$inferSelect | null
              latest_nutrition?: typeof nutritionRecords.$inferSelect | null
              latest_vitamin?: typeof vitaminRecords.$inferSelect | null
          })
        | undefined
    > {
        const condition = includeDeleted
            ? eq(childrens.id, public_id)
            : and(
                  eq(childrens.id, public_id),
                  sql`${childrens.deleted_at} IS NULL`
              )

        const [row] = await this.db
            .select({
                child: childrens,
                mother_name: users.name,
                parent_user_id: parents.user_id,
                posyandu: posyandus
            })
            .from(childrens)
            .leftJoin(posyandus, eq(posyandus.id, childrens.posyandu_id))
            .leftJoin(
                relationChildrens,
                and(
                    eq(relationChildrens.children_id, childrens.id),
                    eq(relationChildrens.relation, 'mother')
                )
            )
            .leftJoin(parents, eq(parents.id, relationChildrens.parent_id))
            .leftJoin(users, eq(users.id, parents.user_id))
            .where(condition)
            .limit(1)

        if (!row) return undefined

        const [latestNutrition] = await this.db
            .select()
            .from(nutritionRecords)
            .where(eq(nutritionRecords.children_id, row.child.id))
            .orderBy(desc(nutritionRecords.measurement_date))
            .limit(1)

        const [latestVitamin] = await this.db
            .select()
            .from(vitaminRecords)
            .where(eq(vitaminRecords.children_id, row.child.id))
            .orderBy(desc(vitaminRecords.created_at))
            .limit(1)

        return {
            ...row.child,
            mother_name: row.mother_name || null,
            parent_user_id: row.parent_user_id || null,
            posyandu_detail: row.posyandu || null,
            latest_nutrition: latestNutrition || null,
            latest_vitamin: latestVitamin || null
        }
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

    async findByParentId(parent_id: string): Promise<Children[]> {
        return this.db
            .select({
                id: childrens.id,
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
                deleted_at: childrens.deleted_at,
                is_deleted: childrens.is_deleted
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
    }

    async softDelete(public_id: string): Promise<Children | undefined> {
        const [child] = await this.db
            .update(childrens)
            .set({ deleted_at: new Date(), is_deleted: true })
            .where(eq(childrens.id, public_id))
            .returning()
        return child
    }

    async restore(public_id: string): Promise<Children | undefined> {
        const [child] = await this.db
            .update(childrens)
            .set({ deleted_at: null, is_deleted: false })
            .where(eq(childrens.id, public_id))
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

    async checkUniqueConstraints(data: { identity_number?: string | null }) {
        const identityExists = data.identity_number
            ? await this.existsByIdentityNumber(data.identity_number)
            : false
        return {
            identityExists
        }
    }

    async linkParent(children_id: string, parent_id: string): Promise<void> {
        await this.db
            .delete(relationChildrens)
            .where(eq(relationChildrens.children_id, children_id))

        await this.db.insert(relationChildrens).values({
            parent_id: parent_id,
            children_id: children_id,
            relation: 'mother'
        })
    }

    async unlinkParent(children_id: string): Promise<void> {
        await this.db
            .delete(relationChildrens)
            .where(eq(relationChildrens.children_id, children_id))
    }
}
