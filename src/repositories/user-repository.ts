import { NewUser, User, users } from '@/db'
import { and, eq, ilike, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface UserQueryFilters {
    search?: string
    role?: User['role']
    status?: User['status']
    page?: number
    limit?: number
}

export class UserRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_user: NewUser): Promise<User> {
        const [user] = await this.db.insert(users).values(new_user).returning()
        return user
    }

    async ragsAll(): Promise<User[]> {
        return this.db.select().from(users)
    }

    async findManyPaginated(
        filters?: UserQueryFilters
    ): Promise<{ data: User[]; totalItems: number }> {
        const { search, role, status, page = 1, limit = 10 } = filters || {}
        const offset = (page - 1) * limit

        const whereClause = and(
            search ? ilike(users.name, `%${search}%`) : undefined,
            role ? eq(users.role, role) : undefined,
            status ? eq(users.status, status) : undefined
        )

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(users)
                .where(whereClause)
                .limit(limit)
                .offset(offset),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(users)
                .where(whereClause)
        ])

        const totalItems = Number(countResult[0]?.count || 0)

        return { data, totalItems }
    }

    async findById(public_id: string): Promise<User | undefined> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.public_id, public_id))
            .limit(1)
        return user
    }

    async findByName(name: string): Promise<User[]> {
        return this.db
            .select()
            .from(users)
            .where(ilike(users.name, `%${name}%`))
    }

    async findByPhoneNumber(phone_number: string): Promise<User | undefined> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.phone_number, phone_number))
            .limit(1)
        return user
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)
        return user
    }

    async update(
        public_id: string,
        updated_user: Partial<NewUser>
    ): Promise<User | undefined> {
        const [user] = await this.db
            .update(users)
            .set(updated_user)
            .where(eq(users.public_id, public_id))
            .returning()
        return user
    }

    async delete(public_id: string): Promise<User | undefined> {
        const [user] = await this.db
            .delete(users)
            .where(eq(users.public_id, public_id))
            .returning()
        return user
    }

    async existsByEmail(email: string): Promise<boolean> {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1)
        return !!user
    }

    async existsByPhoneNumber(phone_number: string): Promise<boolean> {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.phone_number, phone_number))
            .limit(1)
        return !!user
    }
}
