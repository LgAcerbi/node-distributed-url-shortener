import type { ShortUrl } from '../../domain/entities/short-url';

interface ShortUrlRepository {
  create(shortUrl: ShortUrl): Promise<void>;
  getByCode(code: string): Promise<ShortUrl | null>;
}

export default ShortUrlRepository;
export type { ShortUrlRepository };
