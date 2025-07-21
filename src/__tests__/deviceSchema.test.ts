import { DeviceSchema } from "../schemas";
import { validate } from "../validation";
import * as fs from "fs";
import * as path from "path";

const device = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/device.json"), "utf-8"),
);

test("device fixture validates against schema", () => {
  const parsed = validate(DeviceSchema, device, "strict");
  expect(parsed).toEqual(device);
});
