import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const packageJson = JSON.parse(
    readFileSync(resolve(projectRoot, 'package.json'), 'utf8')
) as { packageManager?: string }
const requiredVersion = packageJson.packageManager?.match(/^bun@(.+)$/)?.[1]

if (!requiredVersion) {
    process.stderr.write(
        'package.json must pin the required version in packageManager.\n'
    )
    process.exit(1)
}

const runningVersion = process.versions['bun']
if (runningVersion !== requiredVersion) {
    process.stderr.write(
        `This project requires Bun ${requiredVersion}; current runtime is ${runningVersion ? `Bun ${runningVersion}` : 'Node.js'}.\n`
    )
    process.exit(1)
}
