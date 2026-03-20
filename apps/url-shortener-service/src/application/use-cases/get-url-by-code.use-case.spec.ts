import test from "node:test";
import assert from "node:assert/strict";

import type { ShortUrlCacheRepository } from "../ports/short-url-cache.repository";
import type { ShortUrlRepository } from "../ports/short-url.repository";
import { NotFoundError } from "@workspace/errors";

import { GetUrlByCodeUseCase } from "./get-url-by-code.use-case";

test("GetUrlByCodeUseCase returns cached value when present", async () => {
    let repositoryCalls = 0;

    const shortUrlRepository: ShortUrlRepository = {
        async create(): Promise<void> {
            console.log("create");
        },
        async getUrlByCode(): Promise<string | null> {
            repositoryCalls += 1;
            return "https://db.example.com";
        },
    };

    const shortUrlCacheRepository: ShortUrlCacheRepository = {
        async getCachedUrlByCode(): Promise<string | null> {
            return "https://cache.example.com";
        },
        async setCachedUrlByCode(): Promise<void> {
            console.log("setCachedUrlByCode");
        },
    };

    const useCase = new GetUrlByCodeUseCase(shortUrlRepository, shortUrlCacheRepository);
    const result = await useCase.execute("abc123");

    assert.equal(result, "https://cache.example.com");
    assert.equal(repositoryCalls, 0);
});

test("GetUrlByCodeUseCase fetches from repository and populates cache on miss", async () => {
    let cachedPayload: { code: string; url: string; expirationTime: number } | null = null;

    const shortUrlRepository: ShortUrlRepository = {
        async create(): Promise<void> {
            console.log("create");
        },
        async getUrlByCode(): Promise<string | null> {
            return "https://db.example.com";
        },
    };

    const shortUrlCacheRepository: ShortUrlCacheRepository = {
        async getCachedUrlByCode(): Promise<string | null> {
            return null;
        },
        async setCachedUrlByCode(code: string, url: string, expirationTime: number): Promise<void> {
            cachedPayload = { code, url, expirationTime };
        },
    };

    const useCase = new GetUrlByCodeUseCase(shortUrlRepository, shortUrlCacheRepository);
    const result = await useCase.execute("abc123");

    assert.equal(result, "https://db.example.com");
    assert.deepEqual(cachedPayload, {
        code: "abc123",
        url: "https://db.example.com",
        expirationTime: 1000 * 60 * 60 * 24 * 30,
    });
});

test("GetUrlByCodeUseCase throws NotFoundError when url is missing", async () => {
    const shortUrlRepository: ShortUrlRepository = {
        async create(): Promise<void> {
            console.log("create");
        },
        async getUrlByCode(): Promise<string | null> {
            return null;
        },
    };

    const shortUrlCacheRepository: ShortUrlCacheRepository = {
        async getCachedUrlByCode(): Promise<string | null> {
            return null;
        },
        async setCachedUrlByCode(): Promise<void> {
            console.log("setCachedUrlByCode");
        },
    };

    const useCase = new GetUrlByCodeUseCase(shortUrlRepository, shortUrlCacheRepository);

    await assert.rejects(
        () => useCase.execute("missing"),
        (error: unknown) => error instanceof NotFoundError,
    );
});
