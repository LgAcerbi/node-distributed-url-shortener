import type { createClient } from 'redis';
import type {
    CachedShortUrlPayload,
    ShortUrlCacheRepository,
} from '../../application';

class RedisShortUrlCacheRepository implements ShortUrlCacheRepository {
    constructor(
        private readonly readClient: ReturnType<typeof createClient>,
        private readonly writeClient: ReturnType<typeof createClient>,
    ) {}

    async getCachedShortUrlByCode(code: string): Promise<CachedShortUrlPayload | null> {
        const cached = await this.readClient.get(code);

        if (!cached) {
            return null;
        }

        try {
            const parsed = JSON.parse(cached) as unknown;
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'id' in parsed &&
                'url' in parsed &&
                typeof (parsed as { id: unknown }).id === 'string' &&
                typeof (parsed as { url: unknown }).url === 'string'
            ) {
                return {
                    id: (parsed as { id: string }).id,
                    url: (parsed as { url: string }).url,
                };
            }
        } catch {
            // legacy plain URL string
        }

        return { id: '', url: cached };
    }

    async setCachedShortUrlByCode(
        code: string,
        payload: CachedShortUrlPayload,
        expirationTime: number,
    ): Promise<void> {
        await this.writeClient.setEx(
            code,
            expirationTime,
            JSON.stringify(payload),
        );
    }
}

export default RedisShortUrlCacheRepository;
export { RedisShortUrlCacheRepository };
