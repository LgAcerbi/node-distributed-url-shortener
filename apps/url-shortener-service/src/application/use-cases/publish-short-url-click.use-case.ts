import type { ClickEventPublisher } from '../ports/click-event-publisher';

import { logger } from '@workspace/logger';

class PublishShortUrlClickUseCase {
    constructor(private readonly clickEventPublisher: ClickEventPublisher) {}

    execute(code: string): void {
        void this.publishSafely(code);
    }

    private async publishSafely(code: string): Promise<void> {
        try {
            await this.clickEventPublisher.publish({
                code,
                clickedAt: new Date().toISOString(),
            });
        } catch (error: unknown) {
            logger.error(
                { code, error },
                'Failed to publish short URL click event',
            );
        }
    }
}

export { PublishShortUrlClickUseCase };
