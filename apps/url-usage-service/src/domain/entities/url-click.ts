class UrlClick {
    constructor(
        public readonly id: string,
        public readonly shortUrlId: string,
        public readonly clickedAt: Date,
        public readonly createdAt: Date,
        public readonly clientIp: string | null,
        public readonly userAgent: string | null,
        public readonly referer: string | null,
        public readonly kafkaMessageId: string,
    ) {
        if (!kafkaMessageId) {
            throw new Error('Kafka message id is required');
        }
    }
}

export default UrlClick;
export { UrlClick };
