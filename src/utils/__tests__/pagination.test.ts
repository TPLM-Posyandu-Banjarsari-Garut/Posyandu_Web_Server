import { createPaginationMeta } from '../pagination'

describe('createPaginationMeta', () => {
    it('calculates the number of pages from the item count', () => {
        expect(createPaginationMeta(2, 10, 25)).toEqual({
            page: 2,
            limit: 10,
            total_items: 25,
            total_pages: 3
        })
    })

    it('returns zero pages when there are no items', () => {
        expect(createPaginationMeta(1, 10, 0).total_pages).toBe(0)
    })
})
