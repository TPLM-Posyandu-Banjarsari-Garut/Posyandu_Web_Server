import db from '@/configs/db'
import { users, type NewUser, type User } from '@/db/schemas/users-schema'
import { eq, ilike } from 'drizzle-orm'

export class UserRepository {
    // create users (ini sesuaikan rolenya)
    async create(data: NewUser): Promise<User> {
        const [user] = await db.insert(users).values(data).returning()
        return user
    }

    // get all users
    async findAll(): Promise<User[]> {
        return db.select().from(users)
    }

    // find by id
    async findById(id: number): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id))
        return user
    }

    // find by email
    async findByEmail(email: string): Promise<User | undefined> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
        return user
    }

    // find by name
    async findByName(name: string): Promise<User[]> {
        return db
            .select()
            .from(users)
            .where(ilike(users.name, `%${name}%`))
    }

    // find by phone number
    async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.phone_number, phoneNumber))
        return user
    }

    // update
    async update(
        id: number,
        data: Partial<NewUser>
    ): Promise<User | undefined> {
        const [user] = await db
            .update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning()
        return user
    }

    // delete
    async delete(id: number): Promise<User | undefined> {
        const [user] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning()
        return user
    }
}
