import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import { generateOpenApiDocs } from '@/configs/swagger-generator'

export const setupSwagger = (app: Express): void => {
    const swaggerDocument = generateOpenApiDocs()

    // Menggunakan CDN assets untuk Swagger UI agar tidak terkendala MIME type di Vercel/Serverless
    const options = {
        customCssUrl: 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css',
        customJs: [
            'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js',
            'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js'
        ]
    }

    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, options)
    )
}
