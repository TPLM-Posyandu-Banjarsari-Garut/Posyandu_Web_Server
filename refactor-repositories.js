const fs = require('fs')
const path = require('path')
const dir = path.join('src', 'repositories')

const files = fs.readdirSync(dir).filter(f => f.endsWith('-repository.ts'))
for (const file of files) {
    if (file === 'user-repository.ts') continue

    let content = fs.readFileSync(path.join(dir, file), 'utf8')
    if (content.includes('findByCondition')) continue

    // Add SQL import if not present
    if (!content.includes('SQL') && content.includes("from 'drizzle-orm'")) {
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

    // Find table name and entity type
    const softDeleteMatch = content.match(
        /async softDelete\(public_id: string\): Promise<([^ |]+) \| undefined>/
    )
    const tableMatch = content.match(
        /const \[\w+\] = await this\.db[\s\S]*?\.update\((\w+)\)/
    )

    if (softDeleteMatch && tableMatch) {
        const entityType = softDeleteMatch[1]
        const tableName = tableMatch[1]

        // Add helpers before softDelete
        const helpers = `
    private async findByCondition(condition: SQL | undefined): Promise<${entityType} | undefined> {
        const [row] = await this.db
            .select()
            .from(${tableName})
            .where(condition)
            .limit(1)
        return row
    }

    private async updateStatus(
        public_id: string,
        status: 'active' | 'inactive'
    ): Promise<${entityType} | undefined> {
        const [row] = await this.db
            .update(${tableName})
            .set({ status } as any)
            .where(eq(${tableName}.id, public_id))
            .returning()
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
        content = content.replace(/(\s*async softDelete)/, helpers + '$1')

        // Refactor findById
        content = content.replace(
            new RegExp(
                `async findById\\(public_id: string\\): Promise<${entityType} \\| undefined> \\{[\\s\\S]*?return \\w+\\s*\\}`
            ),
            `async findById(public_id: string): Promise<${entityType} | undefined> {\n        return this.findByCondition(\n            and(eq(${tableName}.id, public_id), eq(${tableName}.status, 'active'))\n        )\n    }`
        )

        // Refactor softDelete
        content = content.replace(
            new RegExp(
                `async softDelete\\(public_id: string\\): Promise<${entityType} \\| undefined> \\{[\\s\\S]*?return \\w+\\s*\\}`
            ),
            `async softDelete(public_id: string): Promise<${entityType} | undefined> {\n        return this.updateStatus(public_id, 'inactive')\n    }`
        )

        // Refactor restore
        content = content.replace(
            new RegExp(
                `async restore\\(public_id: string\\): Promise<${entityType} \\| undefined> \\{[\\s\\S]*?return \\w+\\s*\\}`
            ),
            `async restore(public_id: string): Promise<${entityType} | undefined> {\n        return this.updateStatus(public_id, 'active')\n    }`
        )

        fs.writeFileSync(path.join(dir, file), content)
        console.log('Refactored ' + file)
    } else {
        console.log('Skipped (no match) ' + file)
    }
}
