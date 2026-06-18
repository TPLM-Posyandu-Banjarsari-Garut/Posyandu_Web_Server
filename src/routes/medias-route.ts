import { Router } from 'express'
import multer from 'multer'
import { MediaController } from '@/controllers/media-controller'
import { MediaService } from '@/services/media-service'
import { MediaRepository } from '@/repositories/media-repository'
import { verifyAuth } from '@/middlewares/verify-auth'
import { AsyncHandler } from '@/utils/async-handler'
import { validateRequest } from '@/middlewares/validate-request'
import {
    getMediasQuerySchema,
    mediaIdParamSchema
} from '@/validations/medias-validation'
import { deleteQuerySchema } from '@/validations/shared-validation'
import db from '@/configs/db'

const router = Router()

const mediaRepository = new MediaRepository(db)
const mediaService = new MediaService(mediaRepository)
const mediaController = new MediaController(mediaService)

const upload = multer({
    storage: multer.memoryStorage()
})

router.post(
    '/upload',
    verifyAuth,
    upload.array('files', 5),
    AsyncHandler(mediaController.uploadMedia)
)

router.get(
    '/',
    verifyAuth,
    validateRequest({ query: getMediasQuerySchema }),
    AsyncHandler(mediaController.getMedias)
)

router.get(
    '/:id',
    verifyAuth,
    validateRequest({ params: mediaIdParamSchema }),
    AsyncHandler(mediaController.getMediaById)
)

router.delete(
    '/:id',
    verifyAuth,
    validateRequest({
        params: mediaIdParamSchema,
        query: deleteQuerySchema
    }),
    AsyncHandler(mediaController.deleteMedia)
)

export default router
