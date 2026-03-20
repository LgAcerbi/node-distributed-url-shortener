import { createClient } from 'redis';

type RedisNodeClientOptions = {
    writeUrl: string;
    readUrl?: string;
    connectTimeoutMs?: number;
    maxReconnectDelayMs?: number;
};

class RedisNodeClient {
    private readonly writeClient: ReturnType<typeof createClient>;
    private readonly readClient: ReturnType<typeof createClient>;
    private hasConnected = false;

    constructor({
        writeUrl,
        readUrl,
        connectTimeoutMs = 5_000,
        maxReconnectDelayMs = 3_000,
    }: RedisNodeClientOptions) {
        if (!writeUrl) {
            throw new Error('Missing Redis write URL');
        }

        const writeClientOptions = {
            url: writeUrl,
            socket: {
                connectTimeout: connectTimeoutMs,
                reconnectStrategy(retries: number) {
                    return Math.min(retries * 100, maxReconnectDelayMs);
                },
            },
        };

        const readClientOptions = {
            url: readUrl ?? writeUrl,
            socket: {
                connectTimeout: connectTimeoutMs,
                reconnectStrategy(retries: number) {
                    return Math.min(retries * 100, maxReconnectDelayMs);
                },
            },
        };

        this.writeClient = createClient(writeClientOptions);
        this.readClient = createClient(readClientOptions);
    }

    getWriteClient(): ReturnType<typeof createClient> {
        return this.writeClient;
    }

    getReadClient(): ReturnType<typeof createClient> {
        return this.readClient;
    }

    async connect(): Promise<void> {
        if (this.hasConnected) {
            return;
        }

        await Promise.all([
            this.writeClient.connect(),
            this.readClient.connect(),
        ]);

        this.hasConnected = true;
    }

    async close(): Promise<void> {
        const closeClient = async (client: ReturnType<typeof createClient>) => {
            if (!client.isOpen) {
                return;
            }

            await client.quit();
        };

        await Promise.all([
            closeClient(this.writeClient),
            closeClient(this.readClient),
        ]);

        this.hasConnected = false;
    }
}

function createRedisNodeClient(options: RedisNodeClientOptions): RedisNodeClient {
    return new RedisNodeClient(options);
}

export { createRedisNodeClient, RedisNodeClient };
export type { RedisNodeClientOptions };
