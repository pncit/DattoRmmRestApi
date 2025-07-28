import { DattoRmmClientConfig } from "./config.js";
import { defaultLogger } from "./logger.js";
import { SlidingWindowRateLimiter } from "./rateLimiter.js";
import { HttpClient } from "./httpClient.js";
import { AuthManager } from "./auth.js";
import { validate, ValidationMode } from "./validation.js";
import { DevicesPageSchema, DevicesPage, Device } from "./schemas.js";
import { ZodError, ZodType } from "zod/v4";
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

  private async getAllPages<
    T,
    P extends { pageDetails?: { nextPageUrl: string | null } },
  >(
    url: string,
    token: string,
    params: Record<string, any> | undefined,
    schema: ZodType<P>,
    extractor: (page: P) => T[],
  ): Promise<Result<T[]>> {
    let nextUrl: string | null | undefined = url;
    let nextParams = params;
    const items: T[] = [];
    while (nextUrl) {
      const res: Result<unknown> = await this.http.request<unknown>({
        method: "GET",
        url: nextUrl,
        headers: { Authorization: `Bearer ${token}` },
        params: nextParams,
      });
      if (!res.ok) return res; // axios error already handled
      let data: P;
      try {
        data = validate(schema, res.value, this.validationMode);
      } catch (e) {
        if (e instanceof ZodError) {
          return { ok: false, error: { type: "validation-error", title: e.message, status: 400, raw: e } };
        }
        return { ok: false, error: { type: "unknown-error", title: String(e), status: 500, raw: e } };
      }
      items.push(...extractor(data));
      nextUrl = data.pageDetails?.nextPageUrl;
      nextParams = undefined;
    }
    return { ok: true, value: items };
  }

  async getAccountDevices(
    params?: Record<string, any>,
  ): Promise<Result<Device[]>> {
    const tokenRes = await this.auth.getToken();
    if (!tokenRes.ok) return tokenRes as any;
    return this.getAllPages<Device, DevicesPage>(
      `${this.config.apiUrl}/api/v2/account/devices`,
      tokenRes.value.accessToken,
      params,
      DevicesPageSchema,
      (p) => p.devices ?? [],
    );
  }

  async updateDeviceUdfs(
    deviceUid: string,
    udf: Partial<Device['udf']>,
  ): Promise<Result<void>> {
    const tokenRes = await this.auth.getToken();
    if (!tokenRes.ok) return tokenRes as any;
    const res = await this.http.request<void>({
      method: "PATCH",
      url: `${this.config.apiUrl}/api/v2/account/devices/${deviceUid}/udf`,
      headers: { Authorization: `Bearer ${tokenRes.value.accessToken}` },
      data: udf,
    });
    return res;
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
