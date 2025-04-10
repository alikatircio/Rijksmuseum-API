import { z } from "zod";

const LinksObjectSchema = z.object({
  self: z.string(),
  web: z.string(),
});

const WebSchema = z.object({
  guid: z.string(),
  offsetPercentageX: z.number(),
  offsetPercentageY: z.number(),
  width: z.number(),
  height: z.number(),
  url: z.string(),
});
const HeaderImageSchema = z.object({
  guid: z.string(),
  offsetPercentageX: z.number(),
  offsetPercentageY: z.number(),
  width: z.number(),
  height: z.number(),
  url: z.string(),
});

export const ArtObjectSchema = z.object({
  links: LinksObjectSchema.optional(),
  id: z.string().optional(),
  title: z.string().optional(),
  objectNumber: z.string().optional(),
  hasImage: z.boolean().optional(),
  principalOrFirstMaker: z.string().optional(),
  longTitle: z.string().optional(),
  showImage: z.boolean().optional(),
  permitDownload: z.boolean().optional(),
  web: WebSchema.optional(),
  headerImage: HeaderImageSchema.optional(),
  productionPlaces: z.array(z.string()).optional(),
});
