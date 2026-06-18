import { Router } from 'express'

import healthRoutes from '@/routes/health-routes'
import userRoutes from '@/routes/users-routes'
import cadreRoutes from '@/routes/cadres-route'
import parentRoutes from '@/routes/parents-route'
import midwifeRoutes from '@/routes/midwifes-route'
import childrenRoutes from '@/routes/childrens-route'
import posyanduRoutes from '@/routes/posyandus-route'
import vitaminRoutes from '@/routes/vitamins-route'
import immunizationRecordRoutes from '@/routes/immunization-records-route'
import vitaminRecordRoutes from '@/routes/vitamin-records-route'
import vaccineRoutes from '@/routes/vaccines-route'
import kipiDetailRoutes from '@/routes/kipi-details-route'
import nutritionRecordRoutes from '@/routes/nutrition-records-route'
import inventoryRoutes from '@/routes/inventories-route'
import educationCategoryRoutes from '@/routes/education-categories-route'
import educationRoutes from '@/routes/educations-route'
import consultationRoutes from '@/routes/consultations-route'
import notificationRoutes from '@/routes/notifications-route'
import mediasRoute from '@/routes/medias-route'
import { rateLimiter } from '@/middlewares/rate-limiter'

const router = Router()

router.use(rateLimiter)
router.use('/api/health', healthRoutes)
router.use('/api/users', userRoutes)
router.use('/api/cadres', cadreRoutes)
router.use('/api/midwifes', midwifeRoutes)
router.use('/api/childrens', childrenRoutes)
router.use('/api/parents', parentRoutes)
router.use('/api/posyandus', posyanduRoutes)
router.use('/api/vitamins', vitaminRoutes)
router.use('/api/immunization-records', immunizationRecordRoutes)
router.use('/api/vitamin-records', vitaminRecordRoutes)
router.use('/api/vaccines', vaccineRoutes)
router.use('/api/kipi-details', kipiDetailRoutes)
router.use('/api/nutrition-records', nutritionRecordRoutes)
router.use('/api/inventories', inventoryRoutes)
router.use('/api/education-categories', educationCategoryRoutes)
router.use('/api/educations', educationRoutes)
router.use('/api/consultations', consultationRoutes)
router.use('/api/notifications', notificationRoutes)
router.use('/api/medias', mediasRoute)

export default router
