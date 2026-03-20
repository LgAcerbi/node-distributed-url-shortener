type ClickEvent = {
    shortUrlId: string;
    code: string;
    clickedAt: string;
    clientIp: string | null;
    userAgent: string | null;
    referer: string | null;
};

interface ClickEventPublisher {
    publish(event: ClickEvent): Promise<void>;
}

export default ClickEventPublisher;
export type { ClickEventPublisher, ClickEvent };
