import { Router } from 'express'

import healthRoutes from '@/routes/health-routes'
import userRoutes from '@/routes/users-routes'
import cadreRoutes from '@/routes/cadres-route'
import parentRoutes from '@/routes/parents-route'
import midwifeRoutes from '@/routes/midwifes-route'
import posyanduRoutes from '@/routes/posyandus-route'
import healthCenterRoutes from '@/routes/health-centers-route'
import vitaminRoutes from '@/routes/vitamins-route'
import immunizationRecordRoutes from '@/routes/immunization-records-route'
import vitaminRecordRoutes from '@/routes/vitamin-records-route'
import vaccineRoutes from '@/routes/vaccines-route'
import kipiDetailRoutes from '@/routes/kipi-details-route'

const router = Router()

router.use('/api/health', healthRoutes)
router.use('/api/users', userRoutes)
router.use('/api/cadres', cadreRoutes)
router.use('/api/midwifes', midwifeRoutes)
router.use('/api/parents', parentRoutes)
router.use('/api/posyandus', posyanduRoutes)
router.use('/api/health-centers', healthCenterRoutes)
router.use('/api/vitamins', vitaminRoutes)
router.use('/api/immunization-records', immunizationRecordRoutes)
router.use('/api/vitamin-records', vitaminRecordRoutes)
router.use('/api/vaccines', vaccineRoutes)
router.use('/api/kipi-details', kipiDetailRoutes)

export default router
