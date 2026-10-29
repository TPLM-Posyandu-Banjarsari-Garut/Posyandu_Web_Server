import {
    subscribePushSchema,
    unsubscribePushSchema
} from '../push-subscriptions-validation'

describe('push subscription schemas', () => {
    it('accepts a valid subscription payload', () => {
        expect(
            subscribePushSchema.safeParse({
                endpoint: 'https://push.example.com/subscription',
                keys: { p256dh: 'public-key', auth: 'auth-key' }
            }).success
        ).toBe(true)
    })

    it('rejects invalid endpoint URLs and missing keys', () => {
        expect(
            subscribePushSchema.safeParse({
                endpoint: 'not-a-url',
                keys: { p256dh: '', auth: 'auth-key' }
            }).success
        ).toBe(false)
    })

    it('validates unsubscribe endpoints', () => {
        expect(
            unsubscribePushSchema.safeParse({
                endpoint: 'https://push.example.com/subscription'
            }).success
        ).toBe(true)
        expect(
            unsubscribePushSchema.safeParse({ endpoint: 'not-a-url' }).success
        ).toBe(false)
    })
})
