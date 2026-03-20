import type { Consumer, EachMessagePayload } from 'kafkajs';
import type { ProcessClickEventUseCase } from '../../application';

import { logger } from '@workspace/logger';

const { CLICK_TOPIC = 'url-clicks' } = process.env;

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

                const event = JSON.parse(value) as {
                    code: string;
                    clickedAt: string;
                };
                logger.info(
                    {
                        topic,
                        partition,
                        offset: message.offset,
                        code: event.code,
                        clickedAt: event.clickedAt,
                    },
                    'Consumed click event message',
                );
                await this.processClickEventUseCase.execute(event);
                logger.info(
                    {
                        topic,
                        partition,
                        offset: message.offset,
                        code: event.code,
                    },
                    'Processed click event message',
                );
            },
        });
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
export { KafkaClickEventConsumer };
