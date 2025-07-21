import { z } from "zod/v4";

export const DevicesTypeSchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
});

export const AntivirusSchema = z.object({
  antivirusProduct: z.string().optional(),
  antivirusStatus: z
    .enum([
      "RunningAndUpToDate",
      "RunningAndNotUpToDate",
      "NotRunning",
      "NotDetected",
    ])
    .optional(),
});

export const PatchManagementSchema = z.object({
  patchStatus: z
    .enum([
      "NoPolicy",
      "NoData",
      "RebootRequired",
      "InstallError",
      "ApprovedPending",
      "FullyPatched",
    ])
    .optional(),
  patchesApprovedPending: z.number().optional(),
  patchesNotApproved: z.number().optional(),
  patchesInstalled: z.number().optional(),
});

export const UdfSchema = z.object(
  Object.fromEntries(
    Array.from({ length: 30 }, (_, i) => [
      `udf${i + 1}`,
      z.string().optional(),
    ]),
  ),
);

export const DeviceSchema = z.object({
  id: z.number().optional(),
  uid: z.string().optional(),
  siteId: z.number().optional(),
  siteUid: z.string().optional(),
  siteName: z.string().optional(),
  deviceType: DevicesTypeSchema.optional(),
  hostname: z.string().optional(),
  intIpAddress: z.string().optional(),
  operatingSystem: z.string().optional(),
  lastLoggedInUser: z.string().optional(),
  domain: z.string().optional(),
  cagVersion: z.string().optional(),
  displayVersion: z.string().optional(),
  extIpAddress: z.string().optional(),
  description: z.string().optional(),
  a64Bit: z.boolean().optional(),
  rebootRequired: z.boolean().optional(),
  online: z.boolean().optional(),
  suspended: z.boolean().optional(),
  deleted: z.boolean().optional(),
  lastSeen: z.string().datetime().optional(),
  lastReboot: z.string().datetime().optional(),
  lastAuditDate: z.string().datetime().optional(),
  creationDate: z.string().datetime().optional(),
  udf: UdfSchema.optional(),
  snmpEnabled: z.boolean().optional(),
  deviceClass: z.enum(["device", "printer", "esxihost", "unknown"]).optional(),
  portalUrl: z.string().optional(),
  warrantyDate: z.string().optional(),
  antivirus: AntivirusSchema.optional(),
  patchManagement: PatchManagementSchema.optional(),
  softwareStatus: z.string().optional(),
  webRemoteUrl: z.string().optional(),
});

export type Device = z.infer<typeof DeviceSchema>;

export const PaginationDataSchema = z.object({
  count: z.number().optional(),
  totalCount: z.number().optional(),
  prevPageUrl: z.string().optional(),
  nextPageUrl: z.string().optional(),
});

export const DevicesPageSchema = z.object({
  pageDetails: PaginationDataSchema.optional(),
  devices: z.array(DeviceSchema).optional(),
});

export type DevicesPage = z.infer<typeof DevicesPageSchema>;
