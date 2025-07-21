import { DattoRmmClientConfig } from "./config.js";
import { defaultLogger } from "./logger.js";
import { SlidingWindowRateLimiter } from "./rateLimiter.js";
import { HttpClient } from "./httpClient.js";
import { AuthManager } from "./auth.js";
import { validate, ValidationMode } from "./validation.js";
import { DevicesPageSchema, DevicesPage, Device } from "./schemas.js";
import { ZodType } from "zod/v4";
import { Result } from "./result.js";

export class DattoRmmClient {
  private rateLimiter: SlidingWindowRateLimiter;
  private http: HttpClient;
  private auth: AuthManager;
  private validationMode: ValidationMode;

  constructor(private config: DattoRmmClientConfig) {
    this.validationMode = config.validationMode ?? "strict";
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

  private async fetchAllPages<
    T,
    P extends { pageDetails?: { nextPageUrl?: string } },
  >(
    url: string,
    token: string,
    params: Record<string, any> | undefined,
    schema: ZodType<P>,
    extractor: (page: P) => T[],
  ): Promise<Result<T[]>> {
    let nextUrl: string | undefined = url;
    let nextParams: Record<string, any> | undefined = params;
    const items: T[] = [];
    while (nextUrl) {
      const res: Result<unknown> = await this.http.request<unknown>({
        method: "GET",
        url: nextUrl,
        headers: { Authorization: `Bearer ${token}` },
        params: nextParams,
      });
      if (!res.ok) return res as any;
      const data: P = validate(schema, res.value, this.validationMode);
      items.push(...extractor(data));
      nextUrl = (data as any).pageDetails?.nextPageUrl || "";
      nextParams = undefined;
    }
    return { ok: true, value: items };
  }

  async getAccountDevices(
    params?: Record<string, any>,
  ): Promise<Result<Device[]>> {
    const tokenRes = await this.auth.getToken();
    if (!tokenRes.ok) return tokenRes as any;
    return this.fetchAllPages<Device, DevicesPage>(
      `${this.config.apiUrl}/api/v2/account/devices`,
      tokenRes.value.accessToken,
      params,
      DevicesPageSchema,
      (p) => p.devices ?? [],
    );
  }

  invalidateToken() {
    this.auth.invalidate();
  }
}

export function createDattoRmmClient(
  config: DattoRmmClientConfig,
): DattoRmmClient {
  return new DattoRmmClient(config);
}
