import { Router } from 'express'
import { detailedHealthCheck } from '@/controllers/health-controller'

const router = Router()

router.get('/', detailedHealthCheck)

export default router
