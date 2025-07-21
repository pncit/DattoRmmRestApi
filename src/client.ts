import { DattoRmmClientConfig } from './config';
import { defaultLogger } from './logger';
import { SlidingWindowRateLimiter } from './rateLimiter';
import { HttpClient } from './httpClient';
import { AuthManager } from './auth';
import { validate, ValidationMode } from './validation';
import { DevicesPageSchema, DevicesPage } from './schemas';
import { Result } from './result';

export class DattoRmmClient {
  private rateLimiter: SlidingWindowRateLimiter;
  private http: HttpClient;
  private auth: AuthManager;
  private validationMode: ValidationMode;

  constructor(private config: DattoRmmClientConfig) {
    this.validationMode = config.validationMode ?? 'strict';
    this.rateLimiter = new SlidingWindowRateLimiter({
      requestsPerWindow: config.rateLimit?.requestsPerWindow ?? 600,
      windowSeconds: config.rateLimit?.windowSeconds ?? 60,
      throttleThresholdPct: config.rateLimit?.throttleThresholdPct ?? 90,
    });
    this.http = new HttpClient({
      axios: config.axiosInstance,
      rateLimiter: this.rateLimiter,
      logger: config.logger ?? defaultLogger,
      retry: { maxAttempts: config.retry?.maxAttempts ?? 3 },
    });
    this.auth = new AuthManager(this.http, config);
  }

  async getAccountDevices(params?: Record<string, any>): Promise<Result<DevicesPage>> {
    const tokenRes = await this.auth.getToken();
    if (!tokenRes.ok) return tokenRes as any;
    const res = await this.http.request<unknown>({
      method: 'GET',
      url: `${this.config.apiUrl}/api/v2/account/devices`,
      headers: { Authorization: `Bearer ${tokenRes.value.accessToken}` },
      params,
    });
    if (!res.ok) return res as any;
    const data = validate(DevicesPageSchema, res.value, this.validationMode);
    return { ok: true, value: data, raw: res.raw };
  }

  invalidateToken() {
    this.auth.invalidate();
  }
}

export function createDattoRmmClient(config: DattoRmmClientConfig): DattoRmmClient {
  return new DattoRmmClient(config);
}
