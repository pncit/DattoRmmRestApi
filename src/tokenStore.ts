export interface TokenInfo {
  accessToken: string;
  expiresAt: number; // epoch ms
}

export class InMemoryTokenStore {
  private token?: TokenInfo;

  set(token: TokenInfo) {
    this.token = token;
  }

  get(): TokenInfo | undefined {
    return this.token;
  }

  invalidate() {
    this.token = undefined;
  }
}
