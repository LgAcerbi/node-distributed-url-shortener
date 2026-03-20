import type { ShortUrl } from '../../domain/entities/short-url';

interface ShortUrlRepository {
  create(shortUrl: ShortUrl): Promise<void>;
  getUrlAndIdByCode(code: string): Promise<{ id: string; url: string } | null>;
}

export default ShortUrlRepository;
export type { ShortUrlRepository };
