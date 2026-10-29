import {
    NewParent,
    Parent,
    parents,
    relationChildrens,
    users,
    childrens,
    sessions
} from '@/db'
import {
    and,
    eq,
    ilike,
    or,
    sql,
    SQL,
    asc,
    desc,
    getTableColumns,
    inArray
} from 'drizzle-orm'
import { encryptedFieldEquals } from '@/db/helpers/encrypted-field'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface ParentQueryFilters {
    search?: string
    nameOnlySearch?: boolean
    user_id?: string
    posyandu_ids?: string[]
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
            nameOnlySearch = false,
            user_id,
            posyandu_ids,
            blood_type,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        const safePage = Math.max(1, page)
        const safeLimit = Math.min(Math.max(1, limit), 100)

        const escapedSearch = search
            ? search.replace(/[%_\\]/g, '\\$&')
            : undefined

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(parents.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(parents.status, 'active')
        }

        const whereClause = and(
            escapedSearch
                ? nameOnlySearch
                    ? ilike(users.name, `%${escapedSearch}%`)
                    : or(
                          encryptedFieldEquals(
                              parents.identity_number,
                              search!,
                              'parents.identity_number'
                          ),
                          ilike(users.name, `%${escapedSearch}%`),
                          encryptedFieldEquals(
                              parents.address_line,
                              search!,
                              'parents.address_line'
                          ),
                          encryptedFieldEquals(
                              users.phone_number,
                              search!,
                              'users.phone_number'
                          )
                      )
                : undefined,
            user_id ? eq(parents.user_id, user_id) : undefined,
            posyandu_ids !== undefined
                ? posyandu_ids.length > 0
                    ? inArray(
                          parents.id,
                          this.db
                              .select({
                                  parent_id: relationChildrens.parent_id
                              })
                              .from(relationChildrens)
                              .innerJoin(
                                  childrens,
                                  eq(
                                      relationChildrens.children_id,
                                      childrens.id
                                  )
                              )
                              .where(
                                  and(
                                      inArray(
                                          childrens.posyandu_id,
                                          posyandu_ids
                                      ),
                                      eq(childrens.is_deleted, false),
                                      sql`${childrens.deleted_at} IS NULL`,
                                      eq(relationChildrens.is_deleted, false),
                                      sql`${relationChildrens.deleted_at} IS NULL`
                                  )
                              )
                      )
                    : sql`false`
                : undefined,
            blood_type ? eq(parents.blood_type, blood_type) : undefined,
            statusCondition,
            !includeDeleted ? eq(parents.is_deleted, false) : undefined,
            !includeDeleted ? eq(users.status, 'active') : undefined
        )

        const dataWithCount = await this.db
            .select({
                ...getTableColumns(parents),
                name: users.name,
                email: users.email,
                phone_number: users.phone_number,
                total_count: sql<number>`count(*) over()`.mapWith(Number)
            })
            .from(parents)
            .innerJoin(users, eq(users.id, parents.user_id))
            .where(whereClause)
            .orderBy(
                order === 'asc'
                    ? asc(parents.created_at)
                    : desc(parents.created_at)
            )
            .limit(safeLimit)
            .offset((safePage - 1) * safeLimit)

        const totalItems = dataWithCount[0]?.total_count ?? 0
        const data = dataWithCount.map(({ total_count, ...parent }) => parent)

        return { data, totalItems }
    }

    async findById(
        public_id: string,
        includeDeleted = false
    ): Promise<Parent | undefined> {
        const condition = includeDeleted
            ? eq(parents.id, public_id)
            : and(
                  eq(parents.id, public_id),
                  eq(parents.status, 'active'),
                  eq(parents.is_deleted, false)
              )
        return this.findByCondition(condition)
    }

    async findByUserId(user_id: string): Promise<Parent | undefined> {
        const [parent] = await this.db
            .select()
            .from(parents)
            .where(
                and(
                    eq(parents.user_id, user_id),
                    eq(parents.status, 'active'),
                    eq(parents.is_deleted, false)
                )
            )
            .limit(1)
        return parent
    }

    async findUserRole(user_id: string) {
        const [user] = await this.db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, user_id))
            .limit(1)
        return user?.role
    }

    async findByIdentityNumber(
        identity_number: string
    ): Promise<Parent | undefined> {
        const [parent] = await this.db
            .select()
            .from(parents)
            .where(
                encryptedFieldEquals(
                    parents.identity_number,
                    identity_number,
                    'parents.identity_number'
                )
            )
            .limit(1)
        return parent
    }

    async update(
        public_id: string,
        updated_parent: Partial<NewParent>
    ): Promise<Parent | undefined> {
        return this.db.transaction(async tx => {
            const [parent] = await tx
                .update(parents)
                .set(updated_parent)
                .where(eq(parents.id, public_id))
                .returning()

            if (parent && updated_parent.status === 'inactive') {
                await tx
                    .delete(sessions)
                    .where(eq(sessions.user_id, parent.user_id))
            }

            return parent
        })
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
        return this.db.transaction(async tx => {
            const [parent] = await tx
                .update(parents)
                .set({ status: 'inactive' })
                .where(eq(parents.id, public_id))
                .returning()

            if (parent) {
                await tx
                    .delete(sessions)
                    .where(eq(sessions.user_id, parent.user_id))
            }

            return parent
        })
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
            .where(
                encryptedFieldEquals(
                    parents.identity_number,
                    identity_number,
                    'parents.identity_number'
                )
            )
            .limit(1)
        return !!parent
    }

    async checkUniqueConstraints(data: {
        user_id?: string | null
        identity_number?: string | null
    }) {
        const [userExists, identityExists] = await Promise.all([
            data.user_id
                ? this.checkExists(eq(parents.user_id, data.user_id))
                : Promise.resolve(false),
            data.identity_number
                ? this.existsByIdentityNumber(data.identity_number)
                : Promise.resolve(false)
        ])
        return {
            userExists,
            identityExists
        }
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
