import { NewUser, User, users, parents, midwifes, cadres } from '@/db'
import { and, eq, ilike, or, sql, SQL, asc, desc } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface UserQueryFilters {
    search?: string
    role?: User['role']
    status?: User['status']
    page?: number
    limit?: number
    includeDeleted?: boolean
    order?: 'asc' | 'desc'
}

export class UserRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_user: NewUser): Promise<User> {
        const [user] = await this.db.insert(users).values(new_user).returning()
        return user
    }

    async findAll(): Promise<User[]> {
        return this.db.select().from(users).where(eq(users.status, 'active'))
    }

    async getUsers(filters?: UserQueryFilters) {
        const {
            search,
            role,
            status,
            page = 1,
            limit = 10,
            includeDeleted = false,
            order = 'desc'
        } = filters || {}

        let statusCondition = undefined
        if (status) {
            statusCondition = eq(users.status, status)
        } else if (!includeDeleted) {
            statusCondition = eq(users.status, 'active')
        }

        const whereClause = and(
            search
                ? or(
                      ilike(users.name, `%${search}%`),
                      ilike(users.email, `%${search}%`)
                  )
                : undefined,
            role ? eq(users.role, role) : undefined,
            statusCondition
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(users)
                .where(whereClause)
                .orderBy(
                    order === 'asc'
                        ? asc(users.created_at)
                        : desc(users.created_at)
                )
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(users)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    private async findByCondition(
        condition: SQL | undefined
    ): Promise<User | undefined> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(condition)
            .limit(1)
        return user
    }

    async findById(public_id: string): Promise<User | undefined> {
        return this.findByCondition(
            and(eq(users.id, public_id), eq(users.status, 'active'))
        )
    }

    async findByPublicId(public_id: string): Promise<User | undefined> {
        return this.findByCondition(eq(users.id, public_id))
    }

    async findByPublicIdWithTransaction(
        trx: typeof this.db,
        public_id: string
    ): Promise<User | undefined> {
        const [user] = await trx
            .select()
            .from(users)
            .where(eq(users.id, public_id))
            .limit(1)
        return user
    }

    async findByName(name: string): Promise<User[]> {
        return this.db
            .select()
            .from(users)
            .where(
                and(ilike(users.name, `%${name}%`), eq(users.status, 'active'))
            )
    }

    async findByPhoneNumber(phone_number: string): Promise<User | undefined> {
        return this.findByCondition(
            and(
                eq(users.phone_number, phone_number),
                eq(users.status, 'active')
            )
        )
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.findByCondition(
            and(eq(users.email, email), eq(users.status, 'active'))
        )
    }

    async update(
        public_id: string,
        updated_user: Partial<NewUser>
    ): Promise<User | undefined> {
        const [user] = await this.db
            .update(users)
            .set(updated_user)
            .where(eq(users.id, public_id))
            .returning()
        return user
    }

    async updateWithTransaction(
        trx: typeof this.db,
        public_id: string,
        user_data: Partial<Omit<User, 'id'>>
    ): Promise<void> {
        await trx.update(users).set(user_data).where(eq(users.id, public_id))
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<User | undefined> {
        const [user] = await this.db
            .update(users)
            .set({ status })
            .where(eq(users.id, public_id))
            .returning()
        return user
    }

    async softDelete(public_id: string): Promise<User | undefined> {
        return this.updateStatus(public_id, 'inactive')
    }

    async hardDelete(public_id: string): Promise<User | undefined> {
        const [user] = await this.db
            .delete(users)
            .where(eq(users.id, public_id))
            .returning()
        return user
    }

    async restore(public_id: string): Promise<User | undefined> {
        return this.updateStatus(public_id, 'active')
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(condition)
            .limit(1)
        return !!user
    }

    async existsByEmail(email: string): Promise<boolean> {
        return this.checkExists(
            and(eq(users.email, email), eq(users.status, 'active'))
        )
    }

    async existsByPhoneNumber(phone_number: string): Promise<boolean> {
        return this.checkExists(
            and(
                eq(users.phone_number, phone_number),
                eq(users.status, 'active')
            )
        )
    }

    async findParentByUserId(user_id: string) {
        const [parent] = await this.db
            .select()
            .from(parents)
            .where(eq(parents.user_id, user_id))
            .limit(1)
        return parent
    }

    async findMidwifeByUserId(user_id: string) {
        const [midwife] = await this.db
            .select()
            .from(midwifes)
            .where(eq(midwifes.user_id, user_id))
            .limit(1)
        return midwife
    }

    async findCadreByUserId(user_id: string) {
        const [cadre] = await this.db
            .select()
            .from(cadres)
            .where(eq(cadres.user_id, user_id))
            .limit(1)
        return cadre
    }
}
