import { Router } from 'express'
import { verifyAuth } from '@/middlewares/verify-auth'
import { AsyncHandler } from '@/utils/async-handler'
import { PushSubscriptionsController } from '@/controllers/push-subscriptions-controller'

const router = Router()

router.get(
    '/public-key',
    AsyncHandler(PushSubscriptionsController.getPublicKey)
)

router.post(
    '/subscribe',
    verifyAuth,
    AsyncHandler(PushSubscriptionsController.subscribe)
)

router.delete(
    '/unsubscribe',
    verifyAuth,
    AsyncHandler(PushSubscriptionsController.unsubscribe)
)

export default router
