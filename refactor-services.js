const fs = require('fs')
const path = require('path')
const dir = path.join('src', 'services')

const files = fs.readdirSync(dir).filter(f => f.endsWith('-service.ts'))
for (const file of files) {
    if (file === 'users-service.ts') continue

    let content = fs.readFileSync(path.join(dir, file), 'utf8')
    if (content.includes('createPaginationMeta')) continue

    // Add imports
    if (content.match(/meta:\s*\{[^}]*total_pages/)) {
        content =
            "import { createPaginationMeta } from '@/utils/pagination'\n" +
            content

        // Replace meta: { ... } with meta: createPaginationMeta(page, limit, totalItems)
        content = content.replace(
            /meta:\s*\{[\s\S]*?total_pages:\s*Math\.ceil\(totalItems\s*\/\s*limit\)[\s\S]*?\}/g,
            'meta: createPaginationMeta(page, limit, totalItems)'
        )

        fs.writeFileSync(path.join(dir, file), content)
        console.log('Refactored ' + file)
    }
}
