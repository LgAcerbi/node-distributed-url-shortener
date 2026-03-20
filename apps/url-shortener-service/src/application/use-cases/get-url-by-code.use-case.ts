import type { ShortUrlRepository } from '../ports/short-url.repository';
import type { ShortUrlCacheRepository } from '../ports/short-url-cache.repository';
import type { PublishShortUrlClickUseCase } from './publish-short-url-click.use-case';

import { NotFoundError } from '@workspace/errors';

const { CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 } = process.env;

class GetUrlByCodeUseCase {
    constructor(
        private readonly shortUrlRepository: ShortUrlRepository,
        private readonly shortUrlCacheRepository: ShortUrlCacheRepository,
        private readonly publishShortUrlClickUseCase: PublishShortUrlClickUseCase,
    ) {}

    async execute(code: string): Promise<string> {
        const cachedUrl = await this.shortUrlCacheRepository.getCachedUrlByCode(code);

        if (!cachedUrl) {
            const url = await this.shortUrlRepository.getUrlByCode(code);

            if (!url) {
                throw new NotFoundError('Short URL not found');
            }

            await this.shortUrlCacheRepository.setCachedUrlByCode(code, url, Number(CACHE_EXPIRATION_TIME));

            this.publishShortUrlClickUseCase.execute(code);

            return url;
        }

        this.publishShortUrlClickUseCase.execute(code);
        
        return cachedUrl;
    }
}

export { GetUrlByCodeUseCase };
