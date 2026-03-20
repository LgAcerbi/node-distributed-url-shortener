import type { createClient } from "redis"
import type { CounterRepository } from "../../application"

const {
    COUNTER_KEY = "counter",
    REDIS_COUNTER_RANGE_SIZE = "10000",
    REDIS_COUNTER_PREFETCH_PERCENT = "20",
} = process.env

type CounterRange = {
    current: number;
    max: number;
}

class RedisRangeCounterRepository implements CounterRepository {
    private activeRange: CounterRange = { current: 1, max: 0 }
    private prefetchedRange: CounterRange | null = null
    private leasePromise: Promise<void> | null = null
    private nextRangePromise: Promise<void> | null = null

    constructor(
        private readonly redisWriteClient: ReturnType<typeof createClient>,
        private readonly counterKey: string = COUNTER_KEY,
        private readonly rangeSize = Number(REDIS_COUNTER_RANGE_SIZE),
        private readonly prefetchPercent = Number(REDIS_COUNTER_PREFETCH_PERCENT),
    ) {}

    async getNextValue(): Promise<number> {
        await this.ensureRangeAvailable()

        const value = this.activeRange.current
        this.activeRange.current += 1

        if (this.shouldPrefetchNextRange()) {
            this.prefetchNextRange()
        }

        return value
    }

    private async ensureRangeAvailable(): Promise<void> {
        if (this.activeRange.current <= this.activeRange.max) {
            return
        }

        await this.acquireLease()
    }

    private async acquireLease(): Promise<void> {
        if (this.prefetchedRange) {
            this.activeRange = this.prefetchedRange
            this.prefetchedRange = null
            return
        }

        if (!this.leasePromise) {
            this.leasePromise = (async () => {
                try {
                    const range = await this.leaseRange()
                    this.activeRange = range
                } finally {
                    this.leasePromise = null
                }
            })()
        }

        await this.leasePromise
    }

    private shouldPrefetchNextRange(): boolean {
        const remaining = this.activeRange.max - this.activeRange.current + 1
        const threshold = Math.max(
            1,
            Math.floor(this.normalizedRangeSize * (this.normalizedPrefetchPercent / 100)),
        )

        return (
            remaining <= threshold &&
            !this.prefetchedRange &&
            !this.nextRangePromise &&
            this.activeRange.current <= this.activeRange.max
        )
    }

    private prefetchNextRange(): void {
        this.nextRangePromise = (async () => {
            try {
                const range = await this.leaseRange()
                this.prefetchedRange = range
            } finally {
                this.nextRangePromise = null
            }
        })()
    }

    private async leaseRange(): Promise<CounterRange> {
        const newMax = await this.redisWriteClient.incrBy(this.counterKey, this.normalizedRangeSize)
        const max = Number(newMax)
        const current = max - this.normalizedRangeSize + 1

        return { current, max }
    }

    private get normalizedRangeSize(): number {
        return Number.isFinite(this.rangeSize) && this.rangeSize > 0 ? Math.floor(this.rangeSize) : 10_000
    }

    private get normalizedPrefetchPercent(): number {
        if (!Number.isFinite(this.prefetchPercent)) {
            return 20
        }

        return Math.max(1, Math.min(90, Math.floor(this.prefetchPercent)))
    }
}

export default RedisRangeCounterRepository
export { RedisRangeCounterRepository }
