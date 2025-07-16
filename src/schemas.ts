import { z } from 'zod';

export const DeviceSchema = z.object({
  id: z.number(),
  uid: z.string(),
  siteId: z.number().optional(),
  siteUid: z.string().optional(),
  siteName: z.string().optional(),
  deviceType: z.string().optional(),
  hostname: z.string().optional(),
  operatingSystem: z.string().optional(),
  lastSeen: z.string().datetime().optional(),
});

export type Device = z.infer<typeof DeviceSchema>;

export const PaginationDataSchema = z.object({
  total: z.number().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export const DevicesPageSchema = z.object({
  pageDetails: PaginationDataSchema.optional(),
  devices: z.array(DeviceSchema).optional(),
});

export type DevicesPage = z.infer<typeof DevicesPageSchema>;
