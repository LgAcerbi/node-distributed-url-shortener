import type { ShortUrlRepository } from '../ports/short-url.repository';
import type { ShortUrlCacheRepository } from '../ports/short-url-cache.repository';
import type { PublishShortUrlClickUseCase } from './publish-short-url-click.use-case';

import { NotFoundError } from '@workspace/errors';

const { CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30 } = process.env;

type GetUrlByCodeInput = {
    code: string;
    clientIp: string | null;
    userAgent: string | null;
    referer: string | null;
};

class GetUrlByCodeUseCase {
    constructor(
        private readonly shortUrlRepository: ShortUrlRepository,
        private readonly shortUrlCacheRepository: ShortUrlCacheRepository,
        private readonly publishShortUrlClickUseCase: PublishShortUrlClickUseCase,
    ) {}

    async execute(input: GetUrlByCodeInput): Promise<string> {
        const { code, clientIp, userAgent, referer } = input;
        const clickedAt = new Date().toISOString();

        let cached = await this.shortUrlCacheRepository.getCachedShortUrlByCode(code);

        if (cached && !cached.id) {
            const row = await this.shortUrlRepository.getUrlAndIdByCode(code);

            if (!row) {
                throw new NotFoundError('Short URL not found');
            }

            cached = row;
            await this.shortUrlCacheRepository.setCachedShortUrlByCode(
                code,
                row,
                Number(CACHE_EXPIRATION_TIME),
            );
        }

        if (cached?.id) {
            this.publishShortUrlClickUseCase.execute({
                shortUrlId: cached.id,
                code,
                clickedAt,
                clientIp,
                userAgent,
                referer,
            });

            return cached.url;
        }

        const row = await this.shortUrlRepository.getUrlAndIdByCode(code);

        if (!row) {
            throw new NotFoundError('Short URL not found');
        }

        await this.shortUrlCacheRepository.setCachedShortUrlByCode(
            code,
            { id: row.id, url: row.url },
            Number(CACHE_EXPIRATION_TIME),
        );

        this.publishShortUrlClickUseCase.execute({
            shortUrlId: row.id,
            code,
            clickedAt,
            clientIp,
            userAgent,
            referer,
        });

        return row.url;
    }
}

export { GetUrlByCodeUseCase };
export type { GetUrlByCodeInput };
