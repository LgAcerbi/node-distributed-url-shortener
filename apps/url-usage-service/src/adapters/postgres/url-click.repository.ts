import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { UrlClickRepository } from '../../application';
import type { UrlClickDbSchema } from './url-click.schema';
import type { UrlClick } from '../../domain/entities/url-click';

import { postgresUrlClickSchema } from './url-click.schema';

class PostgresUrlClickRepository implements UrlClickRepository {
    constructor(private readonly db: NodePgDatabase<UrlClickDbSchema>) {}

    async create(click: UrlClick): Promise<void> {
        await this.db.insert(postgresUrlClickSchema).values({
            id: click.id,
            shortUrlId: click.shortUrlId,
            clientIp: click.clientIp,
            userAgent: click.userAgent,
            referer: click.referer,
            kafkaMessageId: click.kafkaMessageId,
            clickedAt: click.clickedAt,
            createdAt: click.createdAt,
        });
    }
}

export default PostgresUrlClickRepository;
export { PostgresUrlClickRepository };
