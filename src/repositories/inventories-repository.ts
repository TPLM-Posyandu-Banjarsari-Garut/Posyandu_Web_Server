import { NewInventory, Inventory, inventories } from '@/db'
import { and, eq, ilike, sql } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export interface InventoryQueryFilters {
    posyandu_id?: string
    search?: string
    item_type?: Inventory['item_type']
    condition?: Inventory['condition']
    page?: number
    limit?: number
    includeDeleted?: boolean
}

export class InventoryRepository {
    constructor(private readonly db: NodePgDatabase) {}

    async create(new_inventory: NewInventory): Promise<Inventory> {
        const [inventory] = await this.db
            .insert(inventories)
            .values(new_inventory)
            .returning()
        return inventory
    }

    async getInventories(filters?: InventoryQueryFilters) {
        const {
            posyandu_id,
            search,
            item_type,
            condition,
            page = 1,
            limit = 10,
            includeDeleted = false
        } = filters || {}

        const conditions = []

        if (!includeDeleted) {
            conditions.push(sql`${inventories.deleted_at} IS NULL`)
        }

        if (posyandu_id) {
            conditions.push(eq(inventories.posyandu_id, posyandu_id))
        }

        if (search) {
            conditions.push(ilike(inventories.item_name, `%${search}%`))
        }

        if (item_type) {
            conditions.push(eq(inventories.item_type, item_type))
        }

        if (condition) {
            conditions.push(eq(inventories.condition, condition))
        }

        const whereClause = and(...conditions)

        const [data, countResult] = await Promise.all([
            this.db
                .select()
                .from(inventories)
                .where(whereClause)
                .limit(limit)
                .offset((page - 1) * limit),
            this.db
                .select({ count: sql<number>`count(*)` })
                .from(inventories)
                .where(whereClause)
        ])

        return {
            data,
            totalItems: Number(countResult[0]?.count || 0)
        }
    }

    async findById(public_id: string): Promise<Inventory | undefined> {
        const [inventory] = await this.db
            .select()
            .from(inventories)
            .where(
                and(
                    eq(inventories.id, public_id),
                    sql`${inventories.deleted_at} IS NULL`
                )
            )
            .limit(1)
        return inventory
    }

    async update(
        public_id: string,
        updated_inventory: Partial<NewInventory>
    ): Promise<Inventory | undefined> {
        const [inventory] = await this.db
            .update(inventories)
            .set(updated_inventory)
            .where(eq(inventories.id, public_id))
            .returning()
        return inventory
    }

    async softDelete(public_id: string): Promise<Inventory | undefined> {
        const [inventory] = await this.db
            .update(inventories)
            .set({
                deleted_at: new Date()
            })
            .where(eq(inventories.id, public_id))
            .returning()
        return inventory
    }

    async hardDelete(public_id: string): Promise<Inventory | undefined> {
        const [inventory] = await this.db
            .delete(inventories)
            .where(eq(inventories.id, public_id))
            .returning()
        return inventory
    }

    async restore(public_id: string): Promise<Inventory | undefined> {
        const [inventory] = await this.db
            .update(inventories)
            .set({
                deleted_at: null
            })
            .where(eq(inventories.id, public_id))
            .returning()
        return inventory
    }
}
