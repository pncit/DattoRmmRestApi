import type { AxiosInstance } from 'axios';
import type { LoggerLike } from './logger';
import type { RateLimitOptions } from './rateLimiter';
import type { RetryOptions } from './httpClient';
import type { ValidationMode } from './validation';

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
