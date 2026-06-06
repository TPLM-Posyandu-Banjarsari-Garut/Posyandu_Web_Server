import swaggerAutoGen from 'swagger-autogen'

const doc = {
    info: {
        title: 'Express Starter',
        description: 'Express Starter',
        version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http']
}

const options = {
    autoHeaders: true,
    autoQuery: true,
    autoBody: true
}

const outputFile = './src/docs/swagger.json'
const endpointsFiles = ['./src/routes/index-routes.ts']

swaggerAutoGen({ openapi: '3.0.0', options: options })(
    outputFile,
    endpointsFiles,
    doc
)
