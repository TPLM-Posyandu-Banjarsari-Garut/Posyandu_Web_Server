import {
    TrashRepository,
    TrashQueryFilters,
    TrashItem
} from '@/repositories/trash-repository'
import { createPaginationMeta } from '@/utils/pagination'

export class TrashService {
    constructor(private readonly trashRepository: TrashRepository) {}

    async getTrashItems(filters?: TrashQueryFilters) {
        const page = Number(filters?.page || 1)
        const limit = Number(filters?.limit || 10)

        const { data, totalItems } = await this.trashRepository.getTrashItems({
            ...filters,
            page,
            limit
        })

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async restoreTrashItem(type: TrashItem['type'], id: string) {
        return await this.trashRepository.restore(type, id)
    }
}
