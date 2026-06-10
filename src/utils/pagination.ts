export function createPaginationMeta(
    page: number,
    limit: number,
    totalItems: number
) {
    return {
        page,
        limit,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / limit)
    }
}
