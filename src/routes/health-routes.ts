import { Router } from 'express'
import {
    healthCheck,
    detailedHealthCheck,
    readyHealthCheck
} from '@/controllers/health-controller'

const router = Router()

router.get('/live', healthCheck)
router.get('/ready', readyHealthCheck)
router.get('/', detailedHealthCheck)

export default router
