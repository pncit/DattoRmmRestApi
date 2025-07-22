import { createDattoRmmClient } from "../client";
import * as fs from "fs";
import * as path from "path";

const devicesPage = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/devicesPage.json"), "utf-8"),
);
const devicesPage1 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/devicesPage1.json"), "utf-8"),
);
const devicesPage2 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/devicesPage2.json"), "utf-8"),
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
  const devices = (result as any).value;
  expect(devices.length).toBe(1);
  expect(devices[0].hostname).toBe("server1");
  expect(devices[0].antivirus?.antivirusStatus).toBe("RunningAndUpToDate");
});

test("getAccountDevices paginates automatically", async () => {
  const responses = {
    "https://example.com/auth/oauth/token": {
      access_token: "token",
      expires_in: 3600,
    },
    "https://example.com/api/v2/account/devices": devicesPage1,
    "https://example.com/api/v2/account/devices?page=2": devicesPage2,
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
  const devices = (result as any).value;
  expect(devices.length).toBe(2);
  expect(devices[1].hostname).toBe("server2");
  expect(mockAxios.requests.map((r: any) => r.url)).toEqual([
    "https://example.com/auth/oauth/token",
    "https://example.com/api/v2/account/devices",
    "https://example.com/api/v2/account/devices?page=2",
  ]);
});
