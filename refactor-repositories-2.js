const fs = require('fs')
const path = require('path')
const dir = path.join('src', 'repositories')

const files = fs.readdirSync(dir).filter(f => f.endsWith('-repository.ts'))
for (const file of files) {
    if (file === 'user-repository.ts') continue

    let content = fs.readFileSync(path.join(dir, file), 'utf8')
    if (content.includes('findByCondition')) continue

    // Find table name and entity type from findById
    const findByIdMatch = content.match(
        /async findById\(public_id: string\): Promise<([^ |]+) \| undefined> \{[\s\S]*?const \[\w+\] = await this\.db[\s\S]*?\.from\((\w+)\)/
    )

    if (findByIdMatch) {
        const entityType = findByIdMatch[1]
        const tableName = findByIdMatch[2]

        // Add SQL import if not present
        if (
            !content.includes('SQL') &&
            content.includes("from 'drizzle-orm'")
        ) {
            content = content.replace(
                /import \{([^}]+)\} from 'drizzle-orm'/,
                (match, p1) => {
                    return `import {${p1}, SQL } from 'drizzle-orm'`
                }
            )
        } else if (
            !content.includes('SQL') &&
            !content.includes("from 'drizzle-orm'")
        ) {
            content = "import { SQL } from 'drizzle-orm'\n" + content
        }

        const helpers = `
    private async findByCondition(condition: SQL | undefined): Promise<${entityType} | undefined> {
        const [row] = await this.db
            .select()
            .from(${tableName})
            .where(condition)
            .limit(1)
        return row
    }

    private async checkExists(condition: SQL | undefined): Promise<boolean> {
        const [row] = await this.db
            .select({ id: ${tableName}.id })
            .from(${tableName})
            .where(condition)
            .limit(1)
        return !!row
    }
`
        // Insert helpers
        content = content.replace(/(\s*async findById)/, helpers + '$1')

        // Refactor findById
        // Extract the condition from findById
        const whereMatch = content.match(
            /async findById\(public_id: string\): Promise<[^ |]+ \| undefined> \{[\s\S]*?\.where\(([\s\S]*?)\)[\s\S]*?\.limit\(1\)[\s\S]*?return \w+\s*\}/
        )
        if (whereMatch) {
            const condition = whereMatch[1].trim()
            content = content.replace(
                new RegExp(
                    `async findById\\(public_id: string\\): Promise<${entityType} \\| undefined> \\{[\\s\\S]*?\\.limit\\(1\\)[\\s\\S]*?return \\w+\\s*\\}`
                ),
                `async findById(public_id: string): Promise<${entityType} | undefined> {\n        return this.findByCondition(${condition})\n    }`
            )
        }

        fs.writeFileSync(path.join(dir, file), content)
        console.log('Refactored ' + file)
    } else {
        console.log('Skipped (no match) ' + file)
    }
}
