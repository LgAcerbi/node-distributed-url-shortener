import type { ClickEventPublisher } from "../ports/click-event-publisher";

import test from "node:test";
import assert from "node:assert/strict";
import { PublishShortUrlClickUseCase } from "./publish-short-url-click.use-case";

test("PublishShortUrlClickUseCase publishes code and timestamp", () => {
    let publishedCode = "";
    let publishedClickedAt = "";

    const clickEventPublisher: ClickEventPublisher = {
        async publish(event): Promise<void> {
            publishedCode = event.code;
            publishedClickedAt = event.clickedAt;
        },
    };

    const useCase = new PublishShortUrlClickUseCase(clickEventPublisher);
    useCase.execute("abc12");

    assert.equal(publishedCode, "abc12");
    assert.ok(typeof publishedClickedAt === "string");
    assert.ok(!Number.isNaN(Date.parse(publishedClickedAt)));
});
