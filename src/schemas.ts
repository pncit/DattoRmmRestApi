import { z } from "zod/v4";

export const DevicesTypeSchema = z.object({
  category: z.string().or(z.null()),
  type: z.string().or(z.null()),
});

export const AntivirusSchema = z.object({
  antivirusProduct: z.string().or(z.null()),
  antivirusStatus: z
    .enum([
      "RunningAndUpToDate",
      "RunningAndNotUpToDate",
      "NotRunning",
      "NotDetected",
    ]).or(z.null()),
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
    ,
  patchesApprovedPending: z.number(),
  patchesNotApproved: z.number(),
  patchesInstalled: z.number(),
});

export const UdfSchema = z.object({
  'udf1': z.string().or(z.null()),
  'udf2': z.string().or(z.null()),
  'udf3': z.string().or(z.null()),
  'udf4': z.string().or(z.null()),
  'udf5': z.string().or(z.null()),
  'udf6': z.string().or(z.null()),
  'udf7': z.string().or(z.null()),
  'udf8': z.string().or(z.null()),
  'udf9': z.string().or(z.null()),
  'udf10': z.string().or(z.null()),
  'udf11': z.string().or(z.null()),
  'udf12': z.string().or(z.null()),
  'udf13': z.string().or(z.null()),
  'udf14': z.string().or(z.null()),
  'udf15': z.string().or(z.null()),
  'udf16': z.string().or(z.null()),
  'udf17': z.string().or(z.null()),
  'udf18': z.string().or(z.null()),
  'udf19': z.string().or(z.null()),
  'udf20': z.string().or(z.null()),
  'udf21': z.string().or(z.null()),
  'udf22': z.string().or(z.null()),
  'udf23': z.string().or(z.null()),
  'udf24': z.string().or(z.null()),
  'udf25': z.string().or(z.null()),
  'udf26': z.string().or(z.null()),
  'udf27': z.string().or(z.null()),
  'udf28': z.string().or(z.null()),
  'udf29': z.string().or(z.null()),
  'udf30': z.string().or(z.null()),
});

export const DeviceSchema = z.object({
  id: z.number(),
  uid: z.string(),
  siteId: z.number(),
  siteUid: z.string(),
  siteName: z.string(),
  deviceType: DevicesTypeSchema,
  hostname: z.string(),
  intIpAddress: z.string().or(z.null()),
  operatingSystem: z.string().or(z.null()),
  lastLoggedInUser: z.string().or(z.null()),
  domain: z.string().or(z.null()),
  cagVersion: z.string().or(z.null()),
  displayVersion: z.string().or(z.null()),
  extIpAddress: z.string().or(z.null()),
  description: z.string().or(z.null()),
  a64Bit: z.boolean(),
  rebootRequired: z.boolean(),
  online: z.boolean(),
  suspended: z.boolean(),
  deleted: z.boolean(),
  lastSeen: z.number(),
  lastReboot: z.number(),
  lastAuditDate: z.number(),
  creationDate: z.number(),
  udf: UdfSchema,
  snmpEnabled: z.boolean(),
  deviceClass: z.enum(["device", "printer", "esxihost", "unknown"]),
  portalUrl: z.string().or(z.null()),
  warrantyDate: z.string().or(z.null()),
  antivirus: AntivirusSchema,
  patchManagement: PatchManagementSchema,
  softwareStatus: z.string().or(z.null()),
  webRemoteUrl: z.string().or(z.null()),
});

export type Device = z.infer<typeof DeviceSchema>;

export const PaginationDataSchema = z.object({
  count: z.number().optional(),
  totalCount: z.number().optional(),
  prevPageUrl: z.string().or(z.null()),
  nextPageUrl: z.string().or(z.null()),
});

export const DevicesPageSchema = z.object({
  pageDetails: PaginationDataSchema.optional(),
  devices: z.array(DeviceSchema).optional(),
});

export type DevicesPage = z.infer<typeof DevicesPageSchema>;
