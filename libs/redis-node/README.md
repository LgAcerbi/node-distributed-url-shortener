# redis-node

Shared Redis bootstrap client for Nx apps.

## Usage

Import `RedisNodeClient` from the library and provide a write URL. Optionally pass a dedicated read URL.

```ts
import { RedisNodeClient } from '@workspace/redis-node';

const redisClient = new RedisNodeClient({
    writeUrl: process.env.REDIS_WRITE_URL ?? '',
    readUrl: process.env.REDIS_READ_URL,
});

await redisClient.connect();

const writeClient = redisClient.getWriteClient();
const readClient = redisClient.getReadClient();
```

Close both clients on shutdown:

```ts
await redisClient.close();
```
