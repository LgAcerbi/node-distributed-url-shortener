import { randomUUID } from 'node:crypto';
import type { UrlClickRepository } from '../ports/url-click.repository';
import { UrlClick } from '../../domain/entities/url-click';

type ClickEventPayload = {
    shortUrlId: string;
    clickedAt: string;
    clientIp: string | null;
    userAgent: string | null;
    referer: string | null;
};

type ProcessClickEventInput = ClickEventPayload & {
    kafkaMessageId: string;
};

class ProcessClickEventUseCase {
    constructor(private readonly urlClickRepository: UrlClickRepository) {}

    async execute(input: ProcessClickEventInput): Promise<void> {
        const clickedAt = new Date(input.clickedAt);

        if (Number.isNaN(clickedAt.getTime())) {
            throw new Error('Invalid click event timestamp');
        }

        const now = new Date();
        const click = new UrlClick(
            randomUUID(),
            input.shortUrlId,
            clickedAt,
            now,
            input.clientIp,
            input.userAgent,
            input.referer,
            input.kafkaMessageId,
        );
        await this.urlClickRepository.create(click);
    }
}

export { ProcessClickEventUseCase };
export type { ClickEventPayload, ProcessClickEventInput };
