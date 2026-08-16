import { z } from 'zod'

export const subscribePushSchema = z.object({
    endpoint: z.string().url('Endpoint must be a valid URL'),
    keys: z.object({
        p256dh: z.string().min(1, 'p256dh key is required'),
        auth: z.string().min(1, 'auth key is required')
    })
})

export type SubscribePushInput = z.infer<typeof subscribePushSchema>

export const unsubscribePushSchema = z.object({
    endpoint: z.string().url('Endpoint must be a valid URL')
})

export type UnsubscribePushInput = z.infer<typeof unsubscribePushSchema>
