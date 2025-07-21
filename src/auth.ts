import { HttpClient } from "./httpClient";
import { TokenInfo, InMemoryTokenStore } from "./tokenStore";
import { DattoRmmClientConfig } from "./config";
import { Result } from "./result";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
}

export class AuthManager {
  private store = new InMemoryTokenStore();

  constructor(
    private http: HttpClient,
    private config: DattoRmmClientConfig,
  ) {}

  async getToken(): Promise<Result<TokenInfo>> {
    const existing = this.store.get();
    const now = Date.now();
    if (existing && existing.expiresAt > now + 60000) {
      return { ok: true, value: existing };
    }
    return this.refreshToken();
  }

  async refreshToken(): Promise<Result<TokenInfo>> {
    const url = `${this.config.apiUrl}/auth/oauth/token`;
    const basic = Buffer.from(
      `${this.config.apiKey}:${this.config.apiSecret}`,
    ).toString("base64");
    const data = new URLSearchParams({ grant_type: "client_credentials" });
    const res = await this.http.request<TokenResponse>({
      method: "POST",
      url,
      headers: { Authorization: `Basic ${basic}` },
      data,
    });
    if (!res.ok) return res as any;
    const info: TokenInfo = {
      accessToken: res.value.access_token,
      refreshToken: res.value.refresh_token,
      expiresAt: Date.now() + res.value.expires_in * 1000,
    };
    this.store.set(info);
    return { ok: true, value: info };
  }

  invalidate() {
    this.store.invalidate();
  }
}
