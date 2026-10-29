import { cloudflareKv, cloudflareKvClient } from '../cloudflare-kv'

describe('Cloudflare KV configuration', () => {
    it('disables the KV client when credentials are blank', () => {
        expect(cloudflareKvClient).toBeNull()
        expect(cloudflareKv).toBeNull()
    })
})
