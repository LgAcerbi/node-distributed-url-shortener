type CachedShortUrlPayload = {
    id: string;
    url: string;
};

interface ShortUrlCacheRepository {
    getCachedShortUrlByCode(code: string): Promise<CachedShortUrlPayload | null>;
    setCachedShortUrlByCode(
        code: string,
        payload: CachedShortUrlPayload,
        expirationTime: number,
    ): Promise<void>;
}

export default ShortUrlCacheRepository;
export type { CachedShortUrlPayload, ShortUrlCacheRepository };