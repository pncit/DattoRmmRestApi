import { HttpClient } from "./httpClient.js";
import { TokenInfo, InMemoryTokenStore } from "./tokenStore.js";
import { DattoRmmClientConfig } from "./config.js";
import { Result } from "./result.js";

interface TokenResponse {
  access_token: string;
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
    const data = new URLSearchParams({
        grant_type: "password",
        username: this.config.apiKey,
        password: this.config.apiSecret,
      });
    const res = await this.http.request<TokenResponse>({
      method: "POST",
      url,
      auth: {
        username: "public-client",
        password: "public",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data.toString(),
    });
    if (!res.ok) return res as any;
    const info: TokenInfo = {
      accessToken: res.value.access_token,
      expiresAt: Date.now() + res.value.expires_in * 1000,
    };
    this.store.set(info);
    return { ok: true, value: info };
  }

  invalidate() {
    this.store.invalidate();
  }
}
