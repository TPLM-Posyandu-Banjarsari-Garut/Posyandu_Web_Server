import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import env from '@/configs/env'
import { generateOpenApiDocs } from '@/configs/swagger-generator'

export const setupSwagger = (app: Express): void => {
    if (env.NODE_ENV !== 'development') return

    const swaggerDocument = generateOpenApiDocs()

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}
