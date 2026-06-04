import { Router } from 'express'

import healthRoutes from '@/routes/health-routes'
import userRoutes from '@/routes/user-routes'

const router = Router()

router.use('/api/health', healthRoutes)
router.use('/api/users', userRoutes)

export default router
