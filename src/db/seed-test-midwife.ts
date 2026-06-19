import db from '@/configs/db'
import { midwifes } from '@/db/schemas/midwifes-schema'
import { users } from '@/db/schemas/users-schema'
import { posyandus } from '@/db/schemas/posyandus-schema'

async function main() {
    console.log("--- Users ---")
    const allUsers = await db.select().from(users)
    console.log(JSON.stringify(allUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })), null, 2))

    console.log("--- Midwives ---")
    const allMidwives = await db.select().from(midwifes)
    console.log(JSON.stringify(allMidwives, null, 2))

    console.log("--- Posyandus ---")
    const allPosyandus = await db.select().from(posyandus)
    console.log(JSON.stringify(allPosyandus.map(p => ({ id: p.id, name: p.name })), null, 2))
}

main().catch(console.error)
