import { Router } from 'express'
import {
    healthCheck,
    detailedHealthCheck,
    readyHealthCheck
} from '@/controllers/health-controller'

const router = Router()

router.get('/health/live', healthCheck)
router.get('/health/ready', readyHealthCheck)
router.get('/health', detailedHealthCheck)

export default router
