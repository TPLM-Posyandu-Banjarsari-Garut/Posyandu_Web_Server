import { jest } from '@jest/globals'
import type { Vaccine } from '@/db'
import type { VaccineRepository } from '@/repositories/vaccines-repository'
import { VaccineService } from '../vaccines-service'
import { invalidateCache } from '@/utils/cloudflare-cache'
import { ApiError } from '@/utils/api-error'

const vaccine = {
    id: 'vaccine-1',
    name: 'BCG',
    code: 'BCG'
} as Vaccine

function createRepository() {
    return {
        checkUniqueConstraints: jest
            .fn<() => Promise<{ nameExists: boolean; codeExists: boolean }>>()
            .mockResolvedValue({ nameExists: false, codeExists: false }),
        create: jest.fn<() => Promise<Vaccine>>().mockResolvedValue(vaccine),
        getVaccines: jest
            .fn<() => Promise<{ data: Vaccine[]; totalItems: number }>>()
            .mockResolvedValue({ data: [vaccine], totalItems: 1 }),
        findById: jest
            .fn<() => Promise<Vaccine | undefined>>()
            .mockResolvedValue(vaccine),
        update: jest
            .fn<() => Promise<Vaccine | undefined>>()
            .mockResolvedValue(vaccine),
        softDelete: jest
            .fn<() => Promise<Vaccine | undefined>>()
            .mockResolvedValue(vaccine),
        hardDelete: jest
            .fn<() => Promise<Vaccine | undefined>>()
            .mockResolvedValue(vaccine),
        restore: jest
            .fn<() => Promise<Vaccine | undefined>>()
            .mockResolvedValue(vaccine)
    }
}

describe('VaccineService', () => {
    afterEach(async () => {
        await invalidateCache('vaccines')
    })

    it('caches list results and returns pagination metadata', async () => {
        const repository = createRepository()
        const service = new VaccineService(
            repository as unknown as VaccineRepository
        )

        const first = await service.getVaccines({ page: 2, limit: 5 })
        const second = await service.getVaccines({ page: 2, limit: 5 })

        expect(first).toEqual({
            data: [vaccine],
            meta: { page: 2, limit: 5, total_items: 1, total_pages: 1 }
        })
        expect(second).toEqual(first)
        expect(repository.getVaccines).toHaveBeenCalledTimes(1)
    })

    it('rejects duplicate vaccine names or codes before creating', async () => {
        const repository = createRepository()
        repository.checkUniqueConstraints.mockResolvedValue({
            nameExists: true,
            codeExists: false
        })
        const service = new VaccineService(
            repository as unknown as VaccineRepository
        )

        await expect(
            service.createVaccine({ name: 'BCG', code: 'BCG' } as never)
        ).rejects.toMatchObject({
            statusCode: 409,
            message: 'Vaccine name is already registered'
        } satisfies Partial<ApiError>)
        expect(repository.create).not.toHaveBeenCalled()
    })

    it('uses soft delete by default and hard delete when requested', async () => {
        const repository = createRepository()
        const service = new VaccineService(
            repository as unknown as VaccineRepository
        )

        await service.deleteVaccine('vaccine-1')
        await service.deleteVaccine('vaccine-1', true)

        expect(repository.softDelete).toHaveBeenCalledWith('vaccine-1')
        expect(repository.hardDelete).toHaveBeenCalledWith('vaccine-1')
    })

    it('returns a not-found error for an unknown cached record', async () => {
        const repository = createRepository()
        repository.findById.mockResolvedValue(undefined)
        const service = new VaccineService(
            repository as unknown as VaccineRepository
        )

        await expect(service.getVaccineById('missing')).rejects.toMatchObject({
            statusCode: 404,
            message: 'Vaccine not found'
        })
    })
})
