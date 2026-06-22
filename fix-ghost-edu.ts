import { db } from './src/db/index'
import { educations } from './src/db/schemas/educations-schema'
import { eq, isNull, and, sql } from 'drizzle-orm'

async function fixGhostEducations() {
    console.log('Fixing ghost educations...')
    try {
        const result = await db
            .update(educations)
            .set({ deleted_at: sql`now()` })
            .where(
                and(
                    eq(educations.status, 'inactive'),
                    isNull(educations.deleted_at)
                )
            )
            .returning()

        console.log(`Fixed ${result.length} ghost educations!`)
        process.exit(0)
    } catch (err) {
        console.error('Failed to fix:', err)
        process.exit(1)
    }
}

fixGhostEducations()
