const fs = require('fs')
const path = require('path')
const dir = path.join('src', 'controllers')

const files = fs.readdirSync(dir).filter(f => f.endsWith('-controller.ts'))
for (const file of files) {
    if (
        [
            'users-controller.ts',
            'parents-controller.ts',
            'cadres-controller.ts',
            'health-controller.ts',
            'childrens-controller.ts',
            'educations-controller.ts'
        ].includes(file)
    )
        continue

    let content = fs.readFileSync(path.join(dir, file), 'utf8')
    if (content.includes('handleGetByIdRequest')) continue

    // Add imports
    content = content.replace(
        /import \{ logger \} from '@\/utils\/logger'/,
        "import { logger } from '@/utils/logger'\nimport { handleDeleteRequest, handleGetByIdRequest, handleRestoreRequest } from '@/utils/controller-handlers'"
    )

    // Replace getById
    const match = content.match(
        /const (\w+)\s*=\s*await this\.(\w+)\.(get\w+ById)\(public_id\)/
    )
    if (match) {
        const entityVar = match[1]
        const serviceVar = match[2]
        const getByIdMethod = match[3]
        let EntityName = entityVar
            .split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join('')
        if (EntityName === 'Record') EntityName = 'ImmunizationRecord' // Just a fallback if needed
        const deleteMatch = content.match(/await this\.\w+\.(delete\w+)/)
        const restoreMatch = content.match(/await this\.\w+\.(restore\w+)/)
        if (!deleteMatch || !restoreMatch) continue
        const deleteMethod = deleteMatch[1]
        const restoreMethod = restoreMatch[1]

        EntityName = getByIdMethod.replace('get', '').replace('ById', '')

        // getById
        content = content.replace(
            new RegExp(
                `get\\w+ById = async \\(req: Request, res: Response\\) => \\{[\\s\\S]*?return ApiResponse\\.ok\\([\\s\\S]*?${entityVar}\\s*\\)\\s*\\}`
            ),
            `${getByIdMethod} = async (req: Request, res: Response) => {
        return handleGetByIdRequest(
            req,
            res,
            '${EntityName}',
            this.${serviceVar}.${getByIdMethod}.bind(this.${serviceVar})
        )
    }`
        )

        // delete
        content = content.replace(
            new RegExp(
                `delete\\w+ = async \\(req: Request, res: Response\\) => \\{[\\s\\S]*?return ApiResponse\\.ok\\([\\s\\S]*?${entityVar}\\s*\\)\\s*\\}`
            ),
            `${deleteMethod} = async (req: Request, res: Response) => {
        return handleDeleteRequest(
            req,
            res,
            '${EntityName}',
            this.${serviceVar}.${deleteMethod}.bind(this.${serviceVar})
        )
    }`
        )

        // restore
        content = content.replace(
            new RegExp(
                `restore\\w+ = async \\(req: Request, res: Response\\) => \\{[\\s\\S]*?return ApiResponse\\.ok\\([\\s\\S]*?${entityVar}\\s*\\)\\s*\\}`
            ),
            `${restoreMethod} = async (req: Request, res: Response) => {
        return handleRestoreRequest(
            req,
            res,
            '${EntityName}',
            this.${serviceVar}.${restoreMethod}.bind(this.${serviceVar})
        )
    }`
        )

        fs.writeFileSync(path.join(dir, file), content)
        console.log('Refactored ' + file)
    }
}
