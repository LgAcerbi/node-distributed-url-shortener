import type { UrlClick } from '../../domain/entities/url-click';

interface UrlClickRepository {
    create(click: UrlClick): Promise<void>;
}

export default UrlClickRepository;
export type { UrlClickRepository };
