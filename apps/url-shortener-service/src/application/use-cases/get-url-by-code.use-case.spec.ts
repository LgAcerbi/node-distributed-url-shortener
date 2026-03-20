import type { ShortUrlCacheRepository } from "../ports/short-url-cache.repository";
import type { ClickEventPublisher } from "../ports/click-event-publisher";
import type { ShortUrlRepository } from "../ports/short-url.repository";

import test from "node:test";
import assert from "node:assert/strict";
import { NotFoundError } from "@workspace/errors";
import { GetUrlByCodeUseCase } from "./get-url-by-code.use-case";
import { PublishShortUrlClickUseCase } from "./publish-short-url-click.use-case";

test("GetUrlByCodeUseCase returns cached value when present", async () => {
    let repositoryCalls = 0;
    let publishedCode: string | null = null;

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

    const clickEventPublisher: ClickEventPublisher = {
        async publish(event): Promise<void> {
            publishedCode = event.code;
        },
    };

    const publishShortUrlClickUseCase = new PublishShortUrlClickUseCase(clickEventPublisher);
    const useCase = new GetUrlByCodeUseCase(
        shortUrlRepository,
        shortUrlCacheRepository,
        publishShortUrlClickUseCase,
    );
    const result = await useCase.execute("abc123");

    assert.equal(result, "https://cache.example.com");
    assert.equal(repositoryCalls, 0);
    assert.equal(publishedCode, "abc123");
});

test("GetUrlByCodeUseCase fetches from repository and populates cache on miss", async () => {
    let cachedPayload: { code: string; url: string; expirationTime: number } | null = null;
    let publishedCode: string | null = null;

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

    const clickEventPublisher: ClickEventPublisher = {
        async publish(event): Promise<void> {
            publishedCode = event.code;
        },
    };

    const publishShortUrlClickUseCase = new PublishShortUrlClickUseCase(clickEventPublisher);
    const useCase = new GetUrlByCodeUseCase(
        shortUrlRepository,
        shortUrlCacheRepository,
        publishShortUrlClickUseCase,
    );
    const result = await useCase.execute("abc123");

    assert.equal(result, "https://db.example.com");
    assert.deepEqual(cachedPayload, {
        code: "abc123",
        url: "https://db.example.com",
        expirationTime: 1000 * 60 * 60 * 24 * 30,
    });
    assert.equal(publishedCode, "abc123");
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

    const clickEventPublisher: ClickEventPublisher = {
        async publish(): Promise<void> {
            console.log("publish");
        },
    };

    const publishShortUrlClickUseCase = new PublishShortUrlClickUseCase(clickEventPublisher);
    const useCase = new GetUrlByCodeUseCase(
        shortUrlRepository,
        shortUrlCacheRepository,
        publishShortUrlClickUseCase,
    );

    await assert.rejects(
        () => useCase.execute("missing"),
        (error: unknown) => error instanceof NotFoundError,
    );
});
