import { createDattoRmmClient } from "../client";
import * as fs from "fs";
import * as path from "path";

const devicesPage = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/devicesPage.json"), "utf-8"),
);

class MockAxios {
  requests: any[] = [];
  constructor(private responses: Record<string, any>) {}
  async request(config: any) {
    this.requests.push(config);
    const resp = this.responses[config.url];
    if (!resp) {
      throw new Error(`Unexpected request to ${config.url}`);
    }
    return { data: resp };
  }
}

test("getAccountDevices returns validated data", async () => {
  const responses = {
    "https://example.com/auth/oauth/token": {
      access_token: "token",
      refresh_token: "r",
      expires_in: 3600,
    },
    "https://example.com/api/v2/account/devices": devicesPage,
  };
  const mockAxios = new MockAxios(responses) as any;

  const client = createDattoRmmClient({
    apiUrl: "https://example.com",
    apiKey: "k",
    apiSecret: "s",
    axiosInstance: mockAxios,
  });

  const result = await client.getAccountDevices();
  expect(result.ok).toBe(true);
  const page = (result as any).value;
  expect(page.devices?.length).toBe(1);
  expect(page.devices?.[0].hostname).toBe("server1");
  expect(page.devices?.[0].antivirus?.antivirusStatus).toBe(
    "RunningAndUpToDate",
  );
});
