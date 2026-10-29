import { jest } from '@jest/globals'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { VaccineRepository } from '../vaccines-repository'

function createQuery(rows: unknown[]) {
    const query = {
        from: jest.fn(),
        where: jest.fn(),
        orderBy: jest.fn(),
        limit: jest.fn(),
        offset: jest.fn(),
        then: (resolve: (value: unknown[]) => unknown) =>
            Promise.resolve(rows).then(resolve)
    }

    query.from.mockReturnValue(query)
    query.where.mockReturnValue(query)
    query.orderBy.mockReturnValue(query)
    query.limit.mockReturnValue(query)
    query.offset.mockReturnValue(query)
    return query
}

describe('VaccineRepository', () => {
    it('maps counted list rows and clamps pagination bounds', async () => {
        const row = {
            id: 'vaccine-1',
            name: 'BCG',
            total_count: 3
        }
        const query = createQuery([row])
        const db = { select: jest.fn().mockReturnValue(query) }
        const repository = new VaccineRepository(
            db as unknown as NodePgDatabase
        )

        const result = await repository.getVaccines({
            page: 0,
            limit: 500,
            search: 'BCG_%',
            includeDeleted: true,
            order: 'asc'
        })

        expect(result).toEqual({
            data: [{ id: 'vaccine-1', name: 'BCG' }],
            totalItems: 3
        })
        expect(query.limit).toHaveBeenCalledWith(100)
        expect(query.offset).toHaveBeenCalledWith(0)
        expect(query.orderBy).toHaveBeenCalledTimes(1)
    })

    it('runs a separate count query when the requested page is empty', async () => {
        const dataQuery = createQuery([])
        const countQuery = createQuery([{ count: '12' }])
        const db = {
            select: jest
                .fn()
                .mockReturnValueOnce(dataQuery)
                .mockReturnValueOnce(countQuery)
        }
        const repository = new VaccineRepository(
            db as unknown as NodePgDatabase
        )

        await expect(
            repository.getVaccines({ page: 4, limit: 5 })
        ).resolves.toEqual({ data: [], totalItems: 12 })
        expect(db.select).toHaveBeenCalledTimes(2)
    })
})
