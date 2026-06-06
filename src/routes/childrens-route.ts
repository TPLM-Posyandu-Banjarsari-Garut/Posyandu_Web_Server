// import { Router } from 'express'
// import { ChildrenController } from '@/controllers/children-controller'
// import { ChildrenService } from '@/services/children-service'
// import { ChildrenRepository } from '@/repositories/children-repository'
// import { AsyncHandler } from '@/utils/async-handler'
// import { validateRequest } from '@/middlewares/validate-request'
// import { authMiddleware } from '@/middlewares/auth-middleware'
// import {
//     createChildrenSchema,
//     updateChildrenSchema,
//     getChildrensQuerySchema,
//     childrenParamsSchema,
//     deleteChildrenQuerySchema
// } from '@/validations/childrens-validation'
// import db from '@/configs/db'

// const router = Router()

// const children_repository = new ChildrenRepository(db)
// const children_service = new ChildrenService(children_repository)
// const children_controller = new ChildrenController(children_service)

// router.post(
//     '/',
//     authMiddleware,
//     validateRequest({ body: createChildrenSchema }),
//     AsyncHandler(children_controller.createChildren)
// )

// router.get(
//     '/',
//     authMiddleware,
//     validateRequest({ query: getChildrensQuerySchema }),
//     AsyncHandler(children_controller.getChildrens)
// )

// router.get(
//     '/:public_id',
//     authMiddleware,
//     validateRequest({ params: childrenParamsSchema }),
//     AsyncHandler(children_controller.getChildrenById)
// )

// router.put(
//     '/:public_id',
//     authMiddleware,
//     validateRequest({ params: childrenParamsSchema, body: updateChildrenSchema }),
//     AsyncHandler(children_controller.updateChildren)
// )

// router.delete(
//     '/:public_id',
//     authMiddleware,
//     validateRequest({ params: childrenParamsSchema, query: deleteChildrenQuerySchema }),
//     AsyncHandler(children_controller.deleteChildren)
// )

// router.post(
//     '/:public_id/restore',
//     authMiddleware,
//     validateRequest({ params: childrenParamsSchema }),
//     AsyncHandler(children_controller.restoreChildren)
// )

// export default router
