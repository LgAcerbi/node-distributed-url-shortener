import type { ShortUrl } from '../../domain/entities/short-url';

interface ShortUrlRepository {
  create(shortUrl: ShortUrl): Promise<void>;
  getUrlByCode(code: string): Promise<string | null>;
}

export default ShortUrlRepository;
export type { ShortUrlRepository };
