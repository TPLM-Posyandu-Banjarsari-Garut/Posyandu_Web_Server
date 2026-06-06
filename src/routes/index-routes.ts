import { Router } from 'express'

import healthRoutes from '@/routes/health-routes'
import userRoutes from '@/routes/users-routes'

import cadreRoutes from '@/routes/cadres-route'
import parentRoutes from '@/routes/parents-route'
import midwifeRoutes from '@/routes/midwifes-route'

const router = Router()

router.use('/api/health', healthRoutes)
router.use('/api/users', userRoutes)
router.use('/api/cadres', cadreRoutes)
router.use('/api/midwifes', midwifeRoutes)
router.use('/api/parents', parentRoutes)

export default router
