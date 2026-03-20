import { NodePgDrizzleClient } from '@workspace/drizzle-node-pg';
import { KafkaNodeClient } from '@workspace/kafka-node';
import { logger } from '@workspace/logger';
import { ProcessClickEventUseCase } from './application';
import {
    urlClickDbSchema,
    PostgresUrlClickRepository,
    KafkaClickEventConsumer,
} from './adapters';

async function compose({
    databaseUrl,
    kafkaBrokers,
}: {
    databaseUrl: string;
    kafkaBrokers: string[];
}) {
    const pgClient = new NodePgDrizzleClient(databaseUrl, urlClickDbSchema);
    const dbInstance = pgClient.getDbInstance();

    const kafkaNodeClient = new KafkaNodeClient({
        clientId: 'url-usage-service',
        brokers: kafkaBrokers,
    });

    const consumer = kafkaNodeClient.getConsumer('url-usage-service');

    const urlClickRepository = new PostgresUrlClickRepository(dbInstance);
    const processClickEventUseCase = new ProcessClickEventUseCase(
        urlClickRepository,
    );
    const kafkaClickEventConsumer = new KafkaClickEventConsumer(
        consumer,
        processClickEventUseCase,
    );

    await kafkaClickEventConsumer.start();
    logger.info('url-usage-service consumer started');
}

export { compose };
