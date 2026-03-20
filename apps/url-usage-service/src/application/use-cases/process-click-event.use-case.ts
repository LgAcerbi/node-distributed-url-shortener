import { randomUUID } from 'node:crypto';
import type { UrlClickRepository } from '../ports/url-click.repository';
import { UrlClick } from '../../domain/entities/url-click';

type ClickEvent = {
    code: string;
    clickedAt: string;
};

class ProcessClickEventUseCase {
    constructor(private readonly urlClickRepository: UrlClickRepository) {}

    async execute(event: ClickEvent): Promise<void> {
        const clickedAt = new Date(event.clickedAt);

        if (Number.isNaN(clickedAt.getTime())) {
            throw new Error('Invalid click event timestamp');
        }

        const now = new Date();
        const click = new UrlClick(randomUUID(), event.code, clickedAt, now);
        await this.urlClickRepository.create(click);
    }
}

export { ProcessClickEventUseCase };
export type { ClickEvent };
