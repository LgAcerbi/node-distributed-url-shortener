import type { CounterRepository } from './application/ports/counter.repository';

import { NodePgDrizzleClient } from '@workspace/drizzle-node-pg';
import {
    createHttpServer,
    shortUrlDbSchema,
    HttpShortUrlController,
    PostgresShortUrlRepository,
} from './adapters';
import { GenerateShortUrlUseCase } from './application';

const { DATABASE_URL, PORT = 80 } = process.env;

async function compose() {
    const pgClient = new NodePgDrizzleClient(DATABASE_URL ?? '', shortUrlDbSchema);
    const db = pgClient.getDbInstance();

    const httpServer = await createHttpServer(Number(PORT));

    const shortUrlRepository = new PostgresShortUrlRepository(db);

    const counterRepository: CounterRepository = {
        async getNextValue() {
            return 1;
        },
    };

    const generateShortUrlUseCase = new GenerateShortUrlUseCase(
        shortUrlRepository,
        counterRepository,
    );

    const httpShortUrlController = new HttpShortUrlController(
        httpServer,
        generateShortUrlUseCase,
    );

    await httpShortUrlController.addRoutes();

    return httpServer;
}

export { compose };
