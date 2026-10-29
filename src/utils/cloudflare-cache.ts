import { createHash, randomUUID } from 'node:crypto'
import { cloudflareKv } from '@/configs/cloudflare-kv'
import { logger } from '@/utils/logger'

interface CacheEnvelope<T> {
    expiresAt: number
    value: T
}

interface MemoryEntry {
    value: string
    expiresAt: number
}

interface NamespaceVersion {
    value: string
    expiresAt: number
}

const memoryCache = new Map<string, MemoryEntry>()
const namespaceVersions = new Map<string, NamespaceVersion>()
const inFlightLoads = new Map<string, Promise<unknown>>()
const MEMORY_TTL_MS = 5_000
const VERSION_CACHE_TTL_MS = 5_000
const MAX_MEMORY_ENTRIES = 500

function stableValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stableValue)
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, entry]) => [key, stableValue(entry)])
        )
    }
    return value
}

function isNotFound(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    const status = 'status' in error ? error.status : undefined
    const statusCode = 'statusCode' in error ? error.statusCode : undefined
    return status === 404 || statusCode === 404
}

function remember(key: string, value: string, ttlMs: number): void {
    if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
        const oldestKey = memoryCache.keys().next().value
        if (oldestKey) memoryCache.delete(oldestKey)
    }
    memoryCache.set(key, {
        value,
        expiresAt: Date.now() + Math.min(ttlMs, MEMORY_TTL_MS)
    })
}

async function getNamespaceVersion(namespace: string): Promise<string> {
    const cached = namespaceVersions.get(namespace)
    if (cached && cached.expiresAt > Date.now()) return cached.value

    let version = '0'
    if (cloudflareKv) {
        try {
            version =
                (await cloudflareKv.get(`app-cache:version:${namespace}`)) ||
                '0'
        } catch (error) {
            if (!isNotFound(error)) {
                logger.warn(error, 'Cloudflare KV cache version lookup failed')
            }
        }
    }

    namespaceVersions.set(namespace, {
        value: version,
        expiresAt: Date.now() + VERSION_CACHE_TTL_MS
    })
    return version
}

export async function cacheGetOrLoad<T>(
    namespace: string,
    input: unknown,
    ttlSeconds: number,
    loader: () => Promise<T>
): Promise<T> {
    const version = await getNamespaceVersion(namespace)
    const inputHash = createHash('sha256')
        .update(JSON.stringify(stableValue(input)))
        .digest('hex')
    const cacheKey = `app-cache:data:${namespace}:${version}:${inputHash}`
    const memoryEntry = memoryCache.get(cacheKey)

    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
        const envelope = JSON.parse(memoryEntry.value) as CacheEnvelope<T>
        return envelope.value
    }
    if (memoryEntry) memoryCache.delete(cacheKey)

    if (cloudflareKv) {
        try {
            const cached = await cloudflareKv.get(cacheKey)
            if (cached) {
                const envelope = JSON.parse(cached) as CacheEnvelope<T>
                if (envelope.expiresAt > Date.now()) {
                    remember(cacheKey, cached, ttlSeconds * 1000)
                    return envelope.value
                }
            }
        } catch (error) {
            if (!isNotFound(error)) {
                logger.warn(error, 'Cloudflare KV cache read failed')
            }
        }
    }

    const pending = inFlightLoads.get(cacheKey) as Promise<T> | undefined
    if (pending) return pending

    const loadPromise = (async () => {
        const value = await loader()
        if (value === undefined || value === null) return value

        const envelope: CacheEnvelope<T> = {
            expiresAt: Date.now() + ttlSeconds * 1000,
            value
        }
        const serialized = JSON.stringify(envelope)
        remember(cacheKey, serialized, ttlSeconds * 1000)

        if (cloudflareKv) {
            try {
                await cloudflareKv.put(
                    cacheKey,
                    serialized,
                    Math.max(60, ttlSeconds)
                )
            } catch (error) {
                logger.warn(error, 'Cloudflare KV cache write failed')
            }
        }
        return value
    })()

    inFlightLoads.set(cacheKey, loadPromise)
    try {
        return await loadPromise
    } finally {
        inFlightLoads.delete(cacheKey)
    }
}

export async function invalidateCache(namespace: string): Promise<void> {
    const version = randomUUID()
    namespaceVersions.set(namespace, {
        value: version,
        expiresAt: Date.now() + VERSION_CACHE_TTL_MS
    })

    const memoryPrefix = `app-cache:data:${namespace}:`
    for (const key of memoryCache.keys()) {
        if (key.startsWith(memoryPrefix)) memoryCache.delete(key)
    }

    if (!cloudflareKv) return

    try {
        await cloudflareKv.put(`app-cache:version:${namespace}`, version)
    } catch (error) {
        logger.warn(error, 'Cloudflare KV cache invalidation failed')
    }
}
