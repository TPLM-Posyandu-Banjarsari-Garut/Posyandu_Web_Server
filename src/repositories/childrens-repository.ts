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
    getTableColumns,
    or
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

export interface NewbornReportFilters {
    month: number
    year: number
    posyandu_id?: string
    search?: string
    page?: number
    limit?: number
}

export interface NewbornReportSummary {
    total_newborns: number
    male_count: number
    female_count: number
    total_posyandus: number
}

export interface NewbornReportItem {
    id: string
    name: string
    identity_number: string
    gender: 'male' | 'female'
    child_category: string | null
    place_of_birth: string | null
    birth_date: Date | string | null
    birth_order: number | null
    blood_type: string | null
    birth_weight: string | null
    birth_length: string | null
    birth_head_circumference: string | null
    created_at: Date | string | null
    posyandu_id: string
    posyandu_name: string | null
    posyandu_village: string | null
    posyandu_rt: string | null
    posyandu_rw: string | null
    mother_name: string | null
    mother_nik: string | null
    mother_phone: string | null
    mother_address: string | null
    mother_rt: string | null
    mother_rw: string | null
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
        return await this.db
            .select(getTableColumns(childrens))
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

    async getNewbornReport(filters: NewbornReportFilters): Promise<{
        summary: NewbornReportSummary
        data: NewbornReportItem[]
        totalItems: number
    }> {
        const {
            month,
            year,
            posyandu_id,
            search,
            page = 1,
            limit = 10
        } = filters

        const safePage = Math.max(1, page)
        const safeLimit = Math.max(1, Math.min(100, limit))

        const startMonthStr = String(month).padStart(2, '0')
        const lastDay = new Date(year, month, 0).getDate()
        const lastDayStr = String(lastDay).padStart(2, '0')

        const startDateStr = `${year}-${startMonthStr}-01`
        const endDateStr = `${year}-${startMonthStr}-${lastDayStr}`

        const conditions = [
            sql`${childrens.deleted_at} IS NULL`,
            sql`${childrens.birth_date} >= ${startDateStr}::date`,
            sql`${childrens.birth_date} <= ${endDateStr}::date`
        ]

        if (posyandu_id) {
            conditions.push(eq(childrens.posyandu_id, posyandu_id))
        }

        const escapedSearch = search ? sanitizeSearchTerm(search) : undefined
        if (escapedSearch) {
            conditions.push(
                or(
                    ilike(childrens.name, `%${escapedSearch}%`),
                    ilike(childrens.identity_number, `%${escapedSearch}%`)
                )!
            )
        }

        const whereClause = and(...conditions)

        // Single aggregation query for month statistics (0 N+1)
        const [summaryResult] = await this.db
            .select({
                total_newborns: sql<number>`count(*)`.mapWith(Number),
                male_count:
                    sql<number>`count(*) filter (where ${childrens.gender} = 'male')`.mapWith(
                        Number
                    ),
                female_count:
                    sql<number>`count(*) filter (where ${childrens.gender} = 'female')`.mapWith(
                        Number
                    ),
                total_posyandus:
                    sql<number>`count(distinct ${childrens.posyandu_id})`.mapWith(
                        Number
                    )
            })
            .from(childrens)
            .where(whereClause)

        const summary: NewbornReportSummary = {
            total_newborns: summaryResult?.total_newborns ?? 0,
            male_count: summaryResult?.male_count ?? 0,
            female_count: summaryResult?.female_count ?? 0,
            total_posyandus: summaryResult?.total_posyandus ?? 0
        }

        // Single paginated join query with window function count (0 N+1)
        const paginatedList = await this.db
            .select({
                child: childrens,
                posyandu: posyandus,
                mother_name: users.name,
                mother_nik: parents.identity_number,
                mother_phone: users.phone_number,
                mother_address: parents.address_line,
                mother_rt: parents.rt,
                mother_rw: parents.rw,
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
            .orderBy(desc(childrens.birth_date), desc(childrens.created_at))
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        const totalItems =
            paginatedList.length > 0
                ? paginatedList[0].total_count
                : (summaryResult?.total_newborns ?? 0)

        const data: NewbornReportItem[] = paginatedList.map(row => ({
            id: row.child.id,
            name: row.child.name,
            identity_number: row.child.identity_number,
            gender: row.child.gender,
            child_category: row.child.child_category,
            place_of_birth: row.child.place_of_birth,
            birth_date: row.child.birth_date,
            birth_order: row.child.birth_order,
            blood_type: row.child.blood_type,
            birth_weight: row.child.birth_weight,
            birth_length: row.child.birth_length,
            birth_head_circumference: row.child.birth_head_circumference,
            created_at: row.child.created_at,
            posyandu_id: row.child.posyandu_id,
            posyandu_name: row.posyandu?.name ?? null,
            posyandu_village: row.posyandu?.village_name ?? null,
            posyandu_rt: row.posyandu?.rt ?? null,
            posyandu_rw: row.posyandu?.rw ?? null,
            mother_name: row.mother_name,
            mother_nik: row.mother_nik,
            mother_phone: row.mother_phone,
            mother_address: row.mother_address,
            mother_rt: row.mother_rt,
            mother_rw: row.mother_rw
        }))

        return {
            summary,
            data,
            totalItems
        }
    }
}
