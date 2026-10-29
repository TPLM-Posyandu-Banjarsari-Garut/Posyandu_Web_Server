import Cloudflare from 'cloudflare'
import env from '@/configs/env'

const isPlaceholder = (value: string) => /^your[_-]/i.test(value)

const credentialsConfigured =
    Boolean(env.CLOUDFLARE_ACCOUNT_ID) &&
    Boolean(env.CLOUDFLARE_API_TOKEN) &&
    Boolean(env.CLOUDFLARE_KV_NAMESPACE_ID) &&
    !isPlaceholder(env.CLOUDFLARE_ACCOUNT_ID) &&
    !isPlaceholder(env.CLOUDFLARE_API_TOKEN) &&
    !isPlaceholder(env.CLOUDFLARE_KV_NAMESPACE_ID)

export const cloudflareKvClient = credentialsConfigured
    ? new Cloudflare({ apiToken: env.CLOUDFLARE_API_TOKEN })
    : null

const namespace = {
    account_id: env.CLOUDFLARE_ACCOUNT_ID,
    namespace_id: env.CLOUDFLARE_KV_NAMESPACE_ID
}

export const cloudflareKv = cloudflareKvClient
    ? {
          get: async (key: string): Promise<string> => {
              const response =
                  await cloudflareKvClient.kv.namespaces.values.get(
                      key,
                      namespace
                  )
              return response.text()
          },
          put: async (
              key: string,
              value: string,
              expirationTtl?: number
          ): Promise<void> => {
              await cloudflareKvClient.kv.namespaces.values.update(key, {
                  ...namespace,
                  value,
                  ...(expirationTtl ? { expiration_ttl: expirationTtl } : {})
              })
          },
          delete: async (key: string): Promise<void> => {
              await cloudflareKvClient.kv.namespaces.values.delete(
                  key,
                  namespace
              )
          }
      }
    : null
