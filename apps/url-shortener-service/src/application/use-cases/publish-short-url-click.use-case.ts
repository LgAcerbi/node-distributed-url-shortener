import type { ClickEvent, ClickEventPublisher } from '../ports/click-event-publisher';

import { logger } from '@workspace/logger';

const MAX_HEADER_LENGTH = 2048;
const MAX_CLIENT_IP_LENGTH = 45;

type PublishShortUrlClickInput = {
    shortUrlId: string;
    code: string;
    clickedAt: string;
    clientIp: string | null;
    userAgent: string | null;
    referer: string | null;
};

class PublishShortUrlClickUseCase {
    constructor(private readonly clickEventPublisher: ClickEventPublisher) {}

    execute(input: PublishShortUrlClickInput): void {
        void this.publishSafely(input);
    }

    private async publishSafely(input: PublishShortUrlClickInput): Promise<void> {
        const event: ClickEvent = {
            shortUrlId: input.shortUrlId,
            code: input.code,
            clickedAt: input.clickedAt,
            clientIp: input.clientIp
                ? input.clientIp.slice(0, MAX_CLIENT_IP_LENGTH)
                : null,
            userAgent: input.userAgent
                ? input.userAgent.slice(0, MAX_HEADER_LENGTH)
                : null,
            referer: input.referer
                ? input.referer.slice(0, MAX_HEADER_LENGTH)
                : null,
        };

        try {
            await this.clickEventPublisher.publish(event);
        } catch (error: unknown) {
            logger.error(
                { code: input.code, error },
                'Failed to publish short URL click event',
            );
        }
    }
}

export { PublishShortUrlClickUseCase };
export type { PublishShortUrlClickInput };
