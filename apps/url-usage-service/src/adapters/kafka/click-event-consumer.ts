import type { Consumer, EachMessagePayload } from 'kafkajs';
import type { ProcessClickEventUseCase } from '../../application';

import { logger } from '@workspace/logger';

const { CLICK_TOPIC = 'url-clicks' } = process.env;

function buildKafkaMessageId(topic: string, partition: number, offset: string): string {
    return `${topic}:${partition}:${offset}`;
}

class KafkaClickEventConsumer {
    constructor(
        private readonly consumer: Consumer,
        private readonly processClickEventUseCase: ProcessClickEventUseCase,
    ) {}

    async start(): Promise<void> {
        await this.consumer.connect();
        for (;;) {
            try {
                await this.consumer.subscribe({
                    topic: CLICK_TOPIC,
                    fromBeginning: false,
                });

                break;
            } catch (error) {
                if (!this.isUnknownTopicError(error)) {
                    throw error;
                }

                await this.delay(1_000);
            }
        }

        await this.consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
            }: EachMessagePayload) => {
                const value = message.value?.toString();

                if (!value) {
                    return;
                }

                let parsed: unknown;
                try {
                    parsed = JSON.parse(value) as unknown;
                } catch {
                    logger.warn({ topic, partition, offset: message.offset }, 'Invalid JSON in click event');
                    return;
                }

                if (!this.isClickEventPayload(parsed)) {
                    logger.warn(
                        { topic, partition, offset: message.offset },
                        'Click event missing required fields',
                    );
                    return;
                }

                const kafkaMessageId = buildKafkaMessageId(topic, partition, message.offset);

                const codeForLog =
                    typeof parsed.code === 'string' ? parsed.code : undefined;

                logger.info(
                    {
                        topic,
                        partition,
                        offset: message.offset,
                        kafkaMessageId,
                        code: codeForLog,
                        shortUrlId: parsed.shortUrlId,
                        clickedAt: parsed.clickedAt,
                    },
                    'Consumed click event message',
                );

                await this.processClickEventUseCase.execute({
                    shortUrlId: parsed.shortUrlId,
                    clickedAt: parsed.clickedAt,
                    clientIp: parsed.clientIp,
                    userAgent: parsed.userAgent,
                    referer: parsed.referer,
                    kafkaMessageId,
                });

                logger.info(
                    {
                        topic,
                        partition,
                        offset: message.offset,
                        kafkaMessageId,
                        code: codeForLog,
                    },
                    'Processed click event message',
                );
            },
        });
    }

    private isClickEventPayload(
        value: unknown,
    ): value is {
        shortUrlId: string;
        code?: string;
        clickedAt: string;
        clientIp: string | null;
        userAgent: string | null;
        referer: string | null;
    } {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const v = value as Record<string, unknown>;

        return (
            typeof v.shortUrlId === 'string' &&
            typeof v.clickedAt === 'string' &&
            (v.clientIp === null || typeof v.clientIp === 'string') &&
            (v.userAgent === null || typeof v.userAgent === 'string') &&
            (v.referer === null || typeof v.referer === 'string')
        );
    }

    private isUnknownTopicError(error: unknown): boolean {
        if (!(error instanceof Error)) {
            return false;
        }

        return error.message.includes(
            'This server does not host this topic-partition',
        );
    }

    private async delay(ms: number): Promise<void> {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

export default KafkaClickEventConsumer;
export { KafkaClickEventConsumer, buildKafkaMessageId };
