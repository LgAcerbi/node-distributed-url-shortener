import type { ClickEventPublisher } from "../ports/click-event-publisher";

import test from "node:test";
import assert from "node:assert/strict";
import { PublishShortUrlClickUseCase } from "./publish-short-url-click.use-case";

test("PublishShortUrlClickUseCase publishes click event fields", () => {
    let shortUrlId = "";
    let code = "";
    let clickedAt = "";
    let clientIp: string | null = "";
    let userAgent: string | null = "";
    let referer: string | null = "";

    const clickEventPublisher: ClickEventPublisher = {
        async publish(event): Promise<void> {
            shortUrlId = event.shortUrlId;
            code = event.code;
            clickedAt = event.clickedAt;
            clientIp = event.clientIp;
            userAgent = event.userAgent;
            referer = event.referer;
        },
    };

    const useCase = new PublishShortUrlClickUseCase(clickEventPublisher);
    useCase.execute({
        shortUrlId: "550e8400-e29b-41d4-a716-446655440000",
        code: "abc12",
        clickedAt: "2026-01-01T00:00:00.000Z",
        clientIp: "127.0.0.1",
        userAgent: "test-agent",
        referer: "https://ref.example/",
    });

    assert.equal(shortUrlId, "550e8400-e29b-41d4-a716-446655440000");
    assert.equal(code, "abc12");
    assert.equal(clickedAt, "2026-01-01T00:00:00.000Z");
    assert.equal(clientIp, "127.0.0.1");
    assert.equal(userAgent, "test-agent");
    assert.equal(referer, "https://ref.example/");
});
