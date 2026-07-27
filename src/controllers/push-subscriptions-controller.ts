import { Request, Response } from 'express'
import { PushSubscriptionsService } from '@/services/push-subscriptions-service'
import { PushSubscriptionsRepository } from '@/repositories/push-subscriptions-repository'
import db from '@/configs/db'
import {
    subscribePushSchema,
    unsubscribePushSchema
} from '@/validations/push-subscriptions-validation'
import { ApiError } from '@/utils/api-error'
import env from '@/configs/env'

const repository = new PushSubscriptionsRepository(db)
const service = new PushSubscriptionsService(repository)

export class PushSubscriptionsController {
    static async subscribe(req: Request, res: Response): Promise<void> {
        const user = res.locals.user
        if (!user?.id) {
            throw ApiError.unauthorized('User session not found')
        }

        const parsed = subscribePushSchema.parse(req.body)

        const result = await service.subscribe(
            user.id,
            parsed.endpoint,
            parsed.keys.p256dh,
            parsed.keys.auth
        )

        res.status(201).json({
            status: 'success',
            message: 'Push subscription saved successfully',
            data: result
        })
    }

    static async unsubscribe(req: Request, res: Response): Promise<void> {
        const parsed = unsubscribePushSchema.parse(req.body)

        await service.unsubscribe(parsed.endpoint)

        res.status(200).json({
            status: 'success',
            message: 'Push subscription removed successfully'
        })
    }

    static async getPublicKey(_req: Request, res: Response): Promise<void> {
        res.status(200).json({
            status: 'success',
            data: {
                publicKey: env.VAPID_PUBLIC_KEY || ''
            }
        })
    }
}
