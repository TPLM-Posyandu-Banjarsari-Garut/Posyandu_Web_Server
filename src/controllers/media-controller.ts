import { Request, Response } from 'express'
import { MediaService } from '@/services/media-service'
import { MediaQueryFilters } from '@/repositories/media-repository'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'
import { handleGetByIdRequest } from '@/utils/controller-handlers'

export class MediaController {
    constructor(private readonly media_service: MediaService) {}

    uploadMedia = async (req: Request, res: Response) => {
        logger.info('Incoming request: Upload Media')
        const files = req.files as Express.Multer.File[]
        const userId = res.locals.user.id

        const uploaded = await this.media_service.uploadMultiple(files, userId)

        logger.info(
            { count: uploaded.length, userId },
            'Media uploaded successfully'
        )

        return ApiResponse.created(res, 'Media uploaded successfully', uploaded)
    }

    getMedias = async (req: Request, res: Response) => {
        const query = req.query as unknown as MediaQueryFilters
        logger.info({ query }, 'Incoming request: Get Medias list')

        const result = await this.media_service.getMedias(query)
        return ApiResponse.ok(res, 'Medias list retrieved successfully', result)
    }

    getMediaById = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            'Media',
            this.media_service.getMediaById.bind(this.media_service)
        )
    }

    deleteMedia = async (req: Request, res: Response) => {
        const id = (req.params.public_id || req.params.id) as string
        const isPermanent = req.query.permanent === 'true'

        logger.info({ id, isPermanent }, 'Incoming request: Delete Media')

        const deleted = await this.media_service.deleteMedia(id, isPermanent)
        return ApiResponse.ok(res, 'Media deleted successfully', deleted)
    }
}
