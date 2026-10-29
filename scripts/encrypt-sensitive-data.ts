/// <reference types="node" />

import 'dotenv-flow/config'
import pino from 'pino'
import postgres from 'postgres'
import {
    decryptSensitiveValue,
    encryptSensitiveValue,
    validateEncryptionKey
} from '../src/db/helpers/encrypted-field'

const batchSize = 500
const applyChanges = process.argv.includes('--apply')
const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

const fields = [
    ['childrens', 'identity_number', 'childrens.identity_number'],
    ['parents', 'identity_number', 'parents.identity_number'],
    ['parents', 'address_line', 'parents.address_line'],
    ['cadres', 'identity_number', 'cadres.identity_number'],
    ['midwifes', 'identity_number', 'midwifes.identity_number'],
    ['midwifes', 'employee_number', 'midwifes.employee_number'],
    ['midwifes', 'license_number', 'midwifes.license_number'],
    ['users', 'phone_number', 'users.phone_number'],
    ['pregnancy_records', 'notes', 'pregnancy_records.notes'],
    ['nutrition_records', 'notes', 'nutrition_records.notes'],
    [
        'examination_records',
        'result_summary',
        'examination_records.result_summary'
    ],
    ['examination_records', 'notes', 'examination_records.notes'],
    ['immunization_records', 'notes', 'immunization_records.notes'],
    ['kipi_details', 'symptoms', 'kipi_details.symptoms'],
    ['kipi_details', 'action_taken', 'kipi_details.action_taken'],
    [
        'vitamin_records',
        'special_condition_notes',
        'vitamin_records.special_condition_notes'
    ],
    ['vitamin_records', 'notes', 'vitamin_records.notes'],
    ['consultations', 'notes', 'consultations.notes'],
    [
        'consultations',
        'cancellation_reason',
        'consultations.cancellation_reason'
    ]
] as const

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')
validateEncryptionKey()
const client = postgres(databaseUrl, { max: 1 })

async function verifyExistingCiphertext(
    table: string,
    column: string,
    context: string
) {
    let lastId = ''
    while (true) {
        const rows = await client.unsafe<{ id: string; value: string }[]>(
            `SELECT "id", "${column}" AS "value" FROM "${table}" WHERE "id" > $1 AND "${column}" LIKE 'enc:v1:%' ORDER BY "id" LIMIT $2`,
            [lastId, batchSize]
        )
        if (rows.length === 0) break
        for (const row of rows) decryptSensitiveValue(row.value, context)
        lastId = rows[rows.length - 1].id
    }
}

async function main() {
    for (const [table, column, context] of fields) {
        await verifyExistingCiphertext(table, column, context)
        const legacyRows = await client.unsafe<{ count: string }[]>(
            `SELECT count(*)::text AS count FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" NOT LIKE 'enc:v1:%'`
        )
        const count = Number(legacyRows[0]?.count ?? 0)

        if (!applyChanges) {
            logger.info(`${table}.${column}: ${count} rows need encryption`)
            continue
        }

        let encryptedCount = 0
        while (true) {
            const rows = await client.unsafe<{ id: string; value: string }[]>(
                `SELECT "id", "${column}" AS "value" FROM "${table}" WHERE "${column}" IS NOT NULL AND "${column}" NOT LIKE 'enc:v1:%' ORDER BY "id" LIMIT $1`,
                [batchSize]
            )
            if (rows.length === 0) break

            await client.begin(async transaction => {
                for (const row of rows) {
                    const encrypted = encryptSensitiveValue(row.value, context)
                    const updated = await transaction.unsafe<{ id: string }[]>(
                        `UPDATE "${table}" SET "${column}" = $1 WHERE "id" = $2 AND "${column}" = $3 RETURNING "id"`,
                        [encrypted, row.id, row.value]
                    )
                    encryptedCount += updated.length
                }
            })
        }

        logger.info(`${table}.${column}: encrypted ${encryptedCount} rows`)
    }
}

try {
    await main()
    if (!applyChanges) {
        logger.info('Preview only. Add --apply after taking a database backup.')
    }
} catch (error) {
    logger.error(
        {
            errorName: error instanceof Error ? error.name : 'UnknownError'
        },
        'Sensitive-data encryption stopped. No row values were logged.'
    )
    process.exitCode = 1
} finally {
    await client.end()
}
