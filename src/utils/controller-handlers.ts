import { Request, Response } from 'express'
import { ApiResponse } from '@/utils/api-response'
import { logger } from '@/utils/logger'

export async function handleGetByIdRequest<T>(
    req: Request,
    res: Response,
    entityName: string,
    getByIdFn: (id: string) => Promise<T>
) {
    const public_id = req.params.public_id as string
    logger.info({ public_id }, `Incoming request: Get ${entityName} By ID`)

    const result = await getByIdFn(public_id)
    return ApiResponse.ok(res, `${entityName} retrieved successfully`, result)
}

export async function handleDeleteRequest<T>(
    req: Request,
    res: Response,
    entityName: string,
    deleteFn: (id: string, isPermanent: boolean) => Promise<T>
) {
    const public_id = req.params.public_id as string
    const is_permanent = req.query.permanent === 'true'

    logger.warn(
        { public_id, is_permanent },
        `Incoming request: Delete ${entityName}`
    )

    const result = await deleteFn(public_id, is_permanent)
    return ApiResponse.ok(res, `${entityName} deleted successfully`, result)
}

export async function handleRestoreRequest<T>(
    req: Request,
    res: Response,
    entityName: string,
    restoreFn: (id: string) => Promise<T>
) {
    const public_id = req.params.public_id as string
    logger.info({ public_id }, `Incoming request: Restore ${entityName}`)

    const result = await restoreFn(public_id)
    return ApiResponse.ok(res, `${entityName} restored successfully`, result)
}
