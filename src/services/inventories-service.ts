import { NewInventory, Inventory } from '@/db'
import {
    InventoryRepository,
    InventoryQueryFilters
} from '@/repositories/inventories-repository'

export class InventoryService {
    constructor(private readonly inventory_repository: InventoryRepository) {}

    async createInventory(inventory_payload: NewInventory): Promise<Inventory> {
        return this.inventory_repository.create(inventory_payload)
    }

    async getInventories(query_filters?: InventoryQueryFilters) {
        const { page = 1, limit = 10 } = query_filters || {}
        const { data, totalItems } =
            await this.inventory_repository.getInventories(query_filters)

        return {
            data,
            meta: {
                page,
                limit,
                total_items: totalItems,
                total_pages: Math.ceil(totalItems / limit)
            }
        }
    }

    async getInventoryById(public_id: string): Promise<Inventory> {
        const inventory = await this.inventory_repository.findById(public_id)
        if (!inventory) throw new Error('Inventory not found')
        return inventory
    }

    async updateInventory(
        public_id: string,
        inventory_payload: Partial<NewInventory>
    ): Promise<Inventory> {
        await this.getInventoryById(public_id)

        const updated = await this.inventory_repository.update(
            public_id,
            inventory_payload
        )
        if (!updated) throw new Error('Failed to update inventory')
        return updated
    }

    async deleteInventory(
        public_id: string,
        is_permanent: boolean = false
    ): Promise<Inventory> {
        await this.getInventoryById(public_id)

        const deleted = is_permanent
            ? await this.inventory_repository.hardDelete(public_id)
            : await this.inventory_repository.softDelete(public_id)

        if (!deleted) throw new Error('Failed to delete inventory')
        return deleted
    }

    async restoreInventory(public_id: string): Promise<Inventory> {
        const restored = await this.inventory_repository.restore(public_id)
        if (!restored) throw new Error('Failed to restore inventory')
        return restored
    }
}
