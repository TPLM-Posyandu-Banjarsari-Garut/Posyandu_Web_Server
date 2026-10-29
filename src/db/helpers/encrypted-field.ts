import {
    createCipheriv,
    createDecipheriv,
    createHmac,
    hkdfSync,
    randomBytes
} from 'node:crypto'
import { customType } from 'drizzle-orm/pg-core'
import { sql, type SQLWrapper } from 'drizzle-orm'

function parseMasterKey(value: string): Buffer {
    if (/^[\da-f]{64}$/i.test(value)) {
        return Buffer.from(value, 'hex')
    }

    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = Buffer.from(base64, 'base64')
    const canonical = decoded.toString('base64').replace(/=+$/, '')
    if (decoded.length === 32 && canonical === base64.replace(/=+$/, '')) {
        return decoded
    }

    throw new Error(
        'DATA_ENCRYPTION_KEY must be a 32-byte key encoded as 64 hex characters or base64'
    )
}

let masterKey: Buffer | undefined

function getMasterKey(): Buffer {
    if (masterKey) return masterKey
    const key = process.env.DATA_ENCRYPTION_KEY
    if (!key) throw new Error('DATA_ENCRYPTION_KEY is required')
    masterKey = parseMasterKey(key)
    return masterKey
}

export function validateEncryptionKey(): void {
    getMasterKey()
}

function deriveKey(context: string, purpose: 'encryption' | 'blind-index') {
    return Buffer.from(
        hkdfSync(
            'sha256',
            getMasterKey(),
            Buffer.from('posyandu-field-encryption-v1'),
            Buffer.from(`${purpose}:${context}`),
            32
        )
    )
}

export function createBlindIndex(value: string, context: string): string {
    return createHmac('sha256', deriveKey(context, 'blind-index'))
        .update(value, 'utf8')
        .digest('base64url')
}

export function encryptSensitiveValue(value: string, context: string): string {
    const nonce = randomBytes(12)
    const cipher = createCipheriv(
        'aes-256-gcm',
        deriveKey(context, 'encryption'),
        nonce
    )
    const ciphertext = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final()
    ])
    const tag = cipher.getAuthTag()

    return [
        'enc',
        'v1',
        nonce.toString('base64url'),
        tag.toString('base64url'),
        ciphertext.toString('base64url'),
        createBlindIndex(value, context)
    ].join(':')
}

export function decryptSensitiveValue(value: string, context: string): string {
    if (!value.startsWith('enc:v1:')) return value

    const parts = value.split(':')
    const [marker, version, nonceText, tagText, ciphertextText, blindIndex] =
        parts
    if (
        parts.length !== 6 ||
        marker !== 'enc' ||
        version !== 'v1' ||
        !nonceText ||
        !tagText ||
        ciphertextText === undefined ||
        !blindIndex ||
        !/^[A-Za-z0-9_-]{43}$/.test(blindIndex)
    ) {
        throw new Error('Unsupported or malformed encrypted field value')
    }

    try {
        const nonce = Buffer.from(nonceText, 'base64url')
        const tag = Buffer.from(tagText, 'base64url')
        if (nonce.length !== 12 || tag.length !== 16) {
            throw new Error('Malformed encrypted field parameters')
        }
        const decipher = createDecipheriv(
            'aes-256-gcm',
            deriveKey(context, 'encryption'),
            nonce
        )
        decipher.setAuthTag(tag)
        const plaintext = Buffer.concat([
            decipher.update(Buffer.from(ciphertextText, 'base64url')),
            decipher.final()
        ]).toString('utf8')

        if (createBlindIndex(plaintext, context) !== blindIndex) {
            throw new Error('Encrypted field integrity check failed')
        }
        return plaintext
    } catch {
        throw new Error('Unable to decrypt protected field')
    }
}

export function encryptedText(name: string, context: string) {
    return customType<{ data: string; driverData: string }>({
        dataType: () => 'text',
        toDriver: value => encryptSensitiveValue(value, context),
        fromDriver: value => decryptSensitiveValue(value, context)
    })(name)
}

export function encryptedFieldEquals(
    column: SQLWrapper,
    value: string,
    context: string
) {
    return sql`(
        ${column} = ${value}
        OR (
            ${column} LIKE 'enc:v1:%'
            AND split_part(${column}::text, ':', 6) = ${createBlindIndex(value, context)}
        )
    )`
}
