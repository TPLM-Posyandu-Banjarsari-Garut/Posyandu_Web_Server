import db from '@/configs/db'
import { childrens } from '@/db'

async function run() {
    try {
        console.log('Inserting test child...')
        const child = await db
            .insert(childrens)
            .values({
                posyandu_id: 'a8ee52c2-8418-4903-a167-9c98894101e4', // let's see if we can get a valid posyandu id, or any id since it validates references
                name: 'Test Child',
                identity_number: '1234567890123499',
                gender: 'male',
                birth_date: new Date()
            })
            .returning()
        console.log('Success:', child)
    } catch (err) {
        console.error('Error occurred:')
        console.error(err)
    } finally {
        process.exit()
    }
}

run()
