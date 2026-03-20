import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

/**
 * Bound matches `drizzle-orm` `drizzle()` / `NodePgDatabase`: string keys to
 * schema objects (tables / relations).
 */
type DrizzleNodePostgresSchema = {
    [key: string]: object;
};

class NodePgDrizzleClient<TSchema extends DrizzleNodePostgresSchema> {
    private readonly dbInstance: NodePgDatabase<TSchema>;
    private readonly dbPool: Pool;

    constructor(
        connectionString: string,
        schema: TSchema,
    ) {
        if (!connectionString) {
            throw new Error('Missing database connection string');
        }

        this.dbPool = new Pool({ connectionString });
        this.dbInstance = drizzle(this.dbPool, { schema });
    }

    getDbInstance(): NodePgDatabase<TSchema> {
        return this.dbInstance;
    }

    async close(): Promise<void> {
        await this.dbPool.end();
    }
}

function createNodePgDrizzleClient<TSchema extends DrizzleNodePostgresSchema>(
    connectionString: string,
    schema: TSchema,
): NodePgDrizzleClient<TSchema> {
    return new NodePgDrizzleClient(connectionString, schema);
}

export { createNodePgDrizzleClient, NodePgDrizzleClient };
export type { NodePgDatabase };
