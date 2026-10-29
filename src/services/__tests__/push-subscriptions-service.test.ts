import { jest } from '@jest/globals'
import type { PushSubscription } from '@/db'
import type { PushSubscriptionsRepository } from '@/repositories/push-subscriptions-repository'
import { PushSubscriptionsService } from '../push-subscriptions-service'

describe('PushSubscriptionsService', () => {
    it('delegates subscription creation and removal to the repository', async () => {
        const subscription = {
            endpoint: 'https://push.example/subscription'
        } as PushSubscription
        const repository = {
            upsert: jest
                .fn<() => Promise<PushSubscription>>()
                .mockResolvedValue(subscription),
            deleteByEndpoint: jest
                .fn<() => Promise<boolean>>()
                .mockResolvedValue(true),
            findByUserId: jest
                .fn<() => Promise<PushSubscription[]>>()
                .mockResolvedValue([])
        }
        const service = new PushSubscriptionsService(
            repository as unknown as PushSubscriptionsRepository
        )

        await expect(
            service.subscribe('user-1', subscription.endpoint, 'public', 'auth')
        ).resolves.toBe(subscription)
        await expect(service.unsubscribe(subscription.endpoint)).resolves.toBe(
            true
        )
        expect(repository.upsert).toHaveBeenCalledWith({
            user_id: 'user-1',
            endpoint: subscription.endpoint,
            p256dh: 'public',
            auth: 'auth'
        })
        expect(repository.deleteByEndpoint).toHaveBeenCalledWith(
            subscription.endpoint
        )
    })

    it('skips push delivery when VAPID credentials are blank', async () => {
        const repository = {
            upsert: jest.fn(),
            deleteByEndpoint: jest.fn(),
            findByUserId: jest
                .fn<() => Promise<PushSubscription[]>>()
                .mockResolvedValue([])
        }
        const service = new PushSubscriptionsService(
            repository as unknown as PushSubscriptionsRepository
        )

        await expect(
            service.sendPushNotification('user-1', {
                title: 'Reminder',
                body: 'Appointment tomorrow'
            })
        ).resolves.toEqual({ sent: 0, failed: 0 })
        expect(repository.findByUserId).not.toHaveBeenCalled()
    })
})
