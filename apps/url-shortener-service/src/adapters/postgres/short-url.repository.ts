import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ShortUrlRepository } from '../../application';
import type { ShortUrlDbSchema } from './short-url.schema';

import { eq, and, isNull } from 'drizzle-orm';
import { postgresShortUrlSchema } from './short-url.schema';
import { ShortUrl } from '../../domain';

class PostgresShortUrlRepository implements ShortUrlRepository {
    constructor(private readonly db: NodePgDatabase<ShortUrlDbSchema>) {}

    async create(shortUrl: ShortUrl): Promise<void> {
        await this.db.insert(postgresShortUrlSchema).values({
            id: shortUrl.id,
            code: shortUrl.code,
            url: shortUrl.url,
            expiresAt: shortUrl.expiresAt,
            createdAt: shortUrl.createdAt,
            updatedAt: shortUrl.updatedAt,
        });
    }

    async getUrlAndIdByCode(code: string): Promise<{ id: string; url: string } | null> {
        const shortUrl = await this.db
            .select({
                id: postgresShortUrlSchema.id,
                url: postgresShortUrlSchema.url,
            })
            .from(postgresShortUrlSchema)
            .where(and(eq(postgresShortUrlSchema.code, code), isNull(postgresShortUrlSchema.deletedAt)));

        if (!shortUrl[0]) {
            return null;
        }

        return {
            id: String(shortUrl[0].id),
            url: shortUrl[0].url,
        };
    }
}

export default PostgresShortUrlRepository;
export { PostgresShortUrlRepository };
