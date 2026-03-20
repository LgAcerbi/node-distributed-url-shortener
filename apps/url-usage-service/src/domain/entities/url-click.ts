class UrlClick {
    constructor(
        public readonly id: string,
        public readonly shortUrlCode: string,
        public readonly clickedAt: Date,
        public readonly createdAt: Date,
    ) {
        if (!shortUrlCode || shortUrlCode.length > 7) {
            throw new Error('Short URL code must be between 1 and 7 characters');
        }
    }
}

export default UrlClick;
export { UrlClick };
