import { Router } from 'express'

import healthRoutes from '@/routes/health-routes'
import userRoutes from '@/routes/user-routes'

import cadreRoutes from '@/routes/cadre-route'
import midwifeRoutes from '@/routes/midwife-route'
import parentRoutes from '@/routes/parent-route'

const router = Router()

router.use('/api/health', healthRoutes)
router.use('/api/users', userRoutes)
router.use('/api/cadres', cadreRoutes)
router.use('/api/midwifes', midwifeRoutes)
router.use('/api/parents', parentRoutes)

export default router
