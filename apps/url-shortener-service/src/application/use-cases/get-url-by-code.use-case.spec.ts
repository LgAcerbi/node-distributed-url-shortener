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
    let publishedShortUrlId: string | null = null;

    const shortUrlRepository: ShortUrlRepository = {
        async create(): Promise<void> {
            console.log("create");
        },
        async getUrlAndIdByCode(): Promise<{ id: string; url: string } | null> {
            repositoryCalls += 1;
            return { id: "db-id", url: "https://db.example.com" };
        },
    };

    const shortUrlCacheRepository: ShortUrlCacheRepository = {
        async getCachedShortUrlByCode(): Promise<{ id: string; url: string } | null> {
            return { id: "cache-id", url: "https://cache.example.com" };
        },
        async setCachedShortUrlByCode(): Promise<void> {
            console.log("setCachedShortUrlByCode");
        },
    };

    const clickEventPublisher: ClickEventPublisher = {
        async publish(event): Promise<void> {
            publishedShortUrlId = event.shortUrlId;
        },
    };

    const publishShortUrlClickUseCase = new PublishShortUrlClickUseCase(clickEventPublisher);
    const useCase = new GetUrlByCodeUseCase(
        shortUrlRepository,
        shortUrlCacheRepository,
        publishShortUrlClickUseCase,
    );
    const result = await useCase.execute({
        code: "abc123",
        clientIp: "127.0.0.1",
        userAgent: "test-agent",
        referer: null,
    });

    assert.equal(result, "https://cache.example.com");
    assert.equal(repositoryCalls, 0);
    assert.equal(publishedShortUrlId, "cache-id");
});

test("GetUrlByCodeUseCase fetches from repository and populates cache on miss", async () => {
    let cachedPayload: { code: string; id: string; url: string; expirationTime: number } | null = null;
    let publishedShortUrlId: string | null = null;

    const shortUrlRepository: ShortUrlRepository = {
        async create(): Promise<void> {
            console.log("create");
        },
        async getUrlAndIdByCode(): Promise<{ id: string; url: string } | null> {
            return { id: "row-id", url: "https://db.example.com" };
        },
    };

    const shortUrlCacheRepository: ShortUrlCacheRepository = {
        async getCachedShortUrlByCode(): Promise<{ id: string; url: string } | null> {
            return null;
        },
        async setCachedShortUrlByCode(
            code: string,
            payload: { id: string; url: string },
            expirationTime: number,
        ): Promise<void> {
            cachedPayload = { code, id: payload.id, url: payload.url, expirationTime };
        },
    };

    const clickEventPublisher: ClickEventPublisher = {
        async publish(event): Promise<void> {
            publishedShortUrlId = event.shortUrlId;
        },
    };

    const publishShortUrlClickUseCase = new PublishShortUrlClickUseCase(clickEventPublisher);
    const useCase = new GetUrlByCodeUseCase(
        shortUrlRepository,
        shortUrlCacheRepository,
        publishShortUrlClickUseCase,
    );
    const result = await useCase.execute({
        code: "abc123",
        clientIp: null,
        userAgent: null,
        referer: null,
    });

    assert.equal(result, "https://db.example.com");
    assert.deepEqual(cachedPayload, {
        code: "abc123",
        id: "row-id",
        url: "https://db.example.com",
        expirationTime: 1000 * 60 * 60 * 24 * 30,
    });
    assert.equal(publishedShortUrlId, "row-id");
});

test("GetUrlByCodeUseCase throws NotFoundError when url is missing", async () => {
    const shortUrlRepository: ShortUrlRepository = {
        async create(): Promise<void> {
            console.log("create");
        },
        async getUrlAndIdByCode(): Promise<{ id: string; url: string } | null> {
            return null;
        },
    };

    const shortUrlCacheRepository: ShortUrlCacheRepository = {
        async getCachedShortUrlByCode(): Promise<{ id: string; url: string } | null> {
            return null;
        },
        async setCachedShortUrlByCode(): Promise<void> {
            console.log("setCachedShortUrlByCode");
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
        () =>
            useCase.execute({
                code: "missing",
                clientIp: null,
                userAgent: null,
                referer: null,
            }),
        (error: unknown) => error instanceof NotFoundError,
    );
});
