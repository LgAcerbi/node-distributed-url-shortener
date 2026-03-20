# logger

Shared Pino logger for workspace apps.

## Usage

```ts
import { logger, createLogger, getLogger } from '@workspace/logger';

logger.info('service started');

const appLogger = getLogger('url-shortener-service');
appLogger.debug({ port: 3000 }, 'booting');

const customLogger = createLogger({ level: 'warn' });
customLogger.warn('custom level logger');
```

## Environment variables

- `LOG_LEVEL`: overrides default log level.
- `NODE_ENV`: when not `production`, logs are pretty-printed with `pino-pretty`.
