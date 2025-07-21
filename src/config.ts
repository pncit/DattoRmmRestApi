import type { AxiosInstance } from "axios";
import type { LoggerLike } from "./logger.js";
import type { RateLimitOptions } from "./rateLimiter.js";
import type { RetryOptions } from "./httpClient.js";
import type { ValidationMode } from "./validation.js";

export interface DattoRmmClientConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  autoRefresh?: boolean;
  tokenRefreshPct?: number;
  logger?: LoggerLike;
  rateLimit?: Partial<RateLimitOptions>;
  retry?: Partial<RetryOptions>;
  validationMode?: ValidationMode;
  axiosInstance?: AxiosInstance;
  userAgentExtra?: string;
}
