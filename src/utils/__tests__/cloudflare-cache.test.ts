import { jest } from '@jest/globals'
import { cacheGetOrLoad, invalidateCache } from '../cloudflare-cache'

describe('Cloudflare cache helper', () => {
    it('loads once for equivalent inputs and returns cached values', async () => {
        const loader = jest.fn().mockResolvedValue([{ id: 'child-1' }])
        const first = await cacheGetOrLoad(
            'children-list-test',
            { page: 1, filters: { active: true, role: 'parent' } },
            60,
            loader
        )
        const second = await cacheGetOrLoad(
            'children-list-test',
            { filters: { role: 'parent', active: true }, page: 1 },
            60,
            loader
        )

        expect(first).toEqual(second)
        expect(loader).toHaveBeenCalledTimes(1)
    })

    it('deduplicates concurrent cache misses', async () => {
        let resolveLoader!: (value: string) => void
        const loader = jest.fn(
            () =>
                new Promise<string>(resolve => {
                    resolveLoader = resolve
                })
        )
        const first = cacheGetOrLoad('concurrent-test', {}, 60, loader)
        const second = cacheGetOrLoad('concurrent-test', {}, 60, loader)
        await new Promise(resolve => setImmediate(resolve))
        resolveLoader('loaded')

        await expect(Promise.all([first, second])).resolves.toEqual([
            'loaded',
            'loaded'
        ])
        expect(loader).toHaveBeenCalledTimes(1)
    })

    it('does not cache null values and propagates loader failures', async () => {
        const loader = jest
            .fn()
            .mockResolvedValueOnce(null)
            .mockResolvedValue('ok')

        await expect(
            cacheGetOrLoad('null-test', {}, 60, loader)
        ).resolves.toBeNull()
        await expect(cacheGetOrLoad('null-test', {}, 60, loader)).resolves.toBe(
            'ok'
        )
        expect(loader).toHaveBeenCalledTimes(2)

        const failure = new Error('database unavailable')
        await expect(
            cacheGetOrLoad('loader-error-test', {}, 60, async () => {
                throw failure
            })
        ).rejects.toBe(failure)
    })

    it('drops a namespace cache when invalidated', async () => {
        const loader = jest.fn().mockResolvedValue('fresh')
        await cacheGetOrLoad('invalidate-test', { id: 1 }, 60, loader)
        await invalidateCache('invalidate-test')
        await cacheGetOrLoad('invalidate-test', { id: 1 }, 60, loader)

        expect(loader).toHaveBeenCalledTimes(2)
    })
})
