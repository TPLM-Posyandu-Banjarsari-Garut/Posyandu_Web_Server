import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2, R2_BUCKET_NAME } from '@/configs/r2'
import env from '@/configs/env'
import {
    MediaRepository,
    MediaQueryFilters
} from '@/repositories/media-repository'
import { Media, NewMedia } from '@/db'
import { ApiError } from '@/utils/api-error'
import { createPaginationMeta } from '@/utils/pagination'

export class MediaService {
    constructor(private readonly media_repository: MediaRepository) {}

    private getFileCategory(
        extension: string
    ): 'image' | 'video' | 'excel' | 'docs' {
        const ext = extension.toLowerCase()
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi']
        const excelExtensions = ['xls', 'xlsx', 'csv']
        const docsExtensions = ['doc', 'docx', 'pdf', 'txt', 'rtf']

        if (imageExtensions.includes(ext)) return 'image'
        if (videoExtensions.includes(ext)) return 'video'
        if (excelExtensions.includes(ext)) return 'excel'
        if (docsExtensions.includes(ext)) return 'docs'

        throw ApiError.badRequest(
            `Extension .${extension} cannot be categorized into image, video, excel, or docs.`
        )
    }

    async uploadMultiple(
        files: Express.Multer.File[],
        userId: string
    ): Promise<Media[]> {
        if (!files || files.length === 0) {
            throw ApiError.badRequest('No files provided for upload.')
        }

        if (files.length > 5) {
            throw ApiError.badRequest(
                'You can upload a maximum of 5 files at once.'
            )
        }

        const maxSizeBytes = env.MEDIA_UPLOAD_MAX_SIZE_MB * 1024 * 1024
        const allowedExtensions = env.MEDIA_UPLOAD_ALLOWED_EXTENSIONS

        const uploadedMedias: Media[] = []

        for (const file of files) {
            const ext = file.originalname.split('.').pop()?.toLowerCase() || ''

            // Validate extension
            if (!allowedExtensions.includes(ext)) {
                throw ApiError.badRequest(
                    `File extension .${ext} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`
                )
            }

            // Validate size
            if (file.size > maxSizeBytes) {
                throw ApiError.badRequest(
                    `File ${file.originalname} exceeds the limit of ${env.MEDIA_UPLOAD_MAX_SIZE_MB}MB.`
                )
            }

            const category = this.getFileCategory(ext)
            const uniqueId = crypto.randomUUID()
            const sanitizedOriginalName = file.originalname.replace(
                /[^a-zA-Z0-9.-]/g,
                '_'
            )
            const r2Key = `medias/${uniqueId}-${sanitizedOriginalName}`

            // Upload to Cloudflare R2
            await r2.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: r2Key,
                    Body: file.buffer,
                    ContentType: file.mimetype
                })
            )

            // Construct public URL
            const publicBaseUrl = env.R2_PUBLIC_URL?.replace(/\/$/, '')
            const fileUrl = publicBaseUrl
                ? `${publicBaseUrl}/${r2Key}`
                : `https://${R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${r2Key}`

            // Save metadata in database
            const newMedia: NewMedia = {
                file_name: r2Key,
                original_name: file.originalname,
                file_size: file.size,
                mime_type: file.mimetype,
                file_extension: ext,
                file_category: category,
                url: fileUrl,
                r2_key: r2Key,
                uploaded_by: userId
            }

            const savedMedia = await this.media_repository.create(newMedia)
            uploadedMedias.push(savedMedia)
        }

        return uploadedMedias
    }

    async getMedias(filters?: MediaQueryFilters) {
        const { page = 1, limit = 10 } = filters || {}
        const { data, totalItems } =
            await this.media_repository.getMedias(filters)

        return {
            data,
            meta: createPaginationMeta(page, limit, totalItems)
        }
    }

    async getMediaById(id: string): Promise<Media> {
        const item = await this.media_repository.findById(id)
        if (!item) throw ApiError.notFound('Media file not found.')
        return item
    }

    async deleteMedia(id: string, isPermanent = false): Promise<Media> {
        const item = await this.getMediaById(id)

        // Delete from R2 if permanent delete or just standard behaviour
        if (isPermanent) {
            await r2.send(
                new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: item.r2_key
                })
            )
            const deleted = await this.media_repository.hardDelete(id)
            if (!deleted)
                throw ApiError.server('Failed to delete media from database.')
            return deleted
        } else {
            const deleted = await this.media_repository.softDelete(id)
            if (!deleted)
                throw ApiError.server('Failed to delete media from database.')
            return deleted
        }
    }
}
