import 'dotenv/config';
import { compose } from './compositor';

async function main() {
    const { DATABASE_URL, KAFKA_BROKERS } = process.env;

    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL is required');
    }

    if (!KAFKA_BROKERS) {
        throw new Error('KAFKA_BROKERS is required');
    }

    const kafkaBrokers = KAFKA_BROKERS.split(',')
        .map((broker) => broker.trim())
        .filter(Boolean);

    if (kafkaBrokers.length === 0) {
        throw new Error('KAFKA_BROKERS must include at least one broker');
    }

    await compose({
        databaseUrl: DATABASE_URL,
        kafkaBrokers,
    });
}

main();
