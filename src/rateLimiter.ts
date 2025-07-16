export interface RateLimitOptions {
  requestsPerWindow: number;
  windowSeconds: number;
  throttleThresholdPct: number;
}

export class SlidingWindowRateLimiter {
  private timestamps: number[] = [];
  constructor(private opts: RateLimitOptions) {}

  removeOld(now: number) {
    const cutoff = now - this.opts.windowSeconds * 1000;
    while (this.timestamps.length && this.timestamps[0] < cutoff) {
      this.timestamps.shift();
    }
  }

  async acquire(): Promise<boolean> {
    const now = Date.now();
    this.removeOld(now);
    if (this.timestamps.length >= this.opts.requestsPerWindow) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }

  get usagePct(): number {
    this.removeOld(Date.now());
    return (this.timestamps.length / this.opts.requestsPerWindow) * 100;
  }
}
