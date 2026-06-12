import { Express, Request, Response } from 'express'
import { generateOpenApiDocs } from '@/configs/swagger-generator'

const SWAGGER_CDN = 'https://unpkg.com/swagger-ui-dist@5.11.0'

export const setupSwagger = (app: Express): void => {
    const swaggerDocument = generateOpenApiDocs()

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Posyandu Core API - Swagger Docs</title>
    <link rel="stylesheet" href="${SWAGGER_CDN}/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow-y: scroll; }
        *, *::before, *::after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="${SWAGGER_CDN}/swagger-ui-bundle.js"></script>
    <script src="${SWAGGER_CDN}/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function () {
            SwaggerUIBundle({
                url: '/api/docs/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: 'StandaloneLayout',
                validatorUrl: null,
                persistAuthorization: true
            });
        };
    </script>
</body>
</html>`

    app.get('/api/docs', (_req: Request, res: Response) => {
        res.setHeader('Content-Type', 'text/html')
        res.send(html)
    })

    // Endpoint untuk mendapatkan OpenAPI spec dalam format JSON
    app.get('/api/docs/openapi.json', (_req: Request, res: Response) => {
        res.json(swaggerDocument)
    })
}
