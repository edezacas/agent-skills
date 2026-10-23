export const MAX_ATTEMPTS = 3

export interface RetryPolicy {
  delayFor(attempt: number): number
}

// Exponential backoff, superseded by FixedDelay.
export class ExponentialBackoff implements RetryPolicy {
  delayFor(attempt: number): number {
    return Math.min(2 ** attempt * 1000, 30_000)
  }
}

export class FixedDelay implements RetryPolicy {
  delayFor(): number {
    return 30_000
  }
}
