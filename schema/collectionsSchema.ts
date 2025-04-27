import { z } from "zod";

export const ArtObjectSchema = z.object({
  id: z.string().optional(),
  objectNumber: z.string(),
  title: z.string(),
  principalOrFirstMaker: z.string(),
  hasImage: z.boolean(),
  productionPlaces: z.array(z.string()).optional(),
});

export const CollectionListSchema = z.object({
  artObjects: z.array(ArtObjectSchema),
});

export const ArtObjectDetailSchema = z.object({
  artObject: z.object({
    id: z.string(),
    title: z.string(),
    objectNumber: z.string(),
    principalOrFirstMaker: z.string(),
    description: z.string().optional(),
    productionPlaces: z.array(z.string()).optional(),
    hasImage: z.boolean().optional(),
    webImage: z
      .object({
        guid: z.string(),
        url: z.string(),
        width: z.number(),
        height: z.number(),
        offsetPercentageX: z.number(),
        offsetPercentageY: z.number(),
      })
      .optional(),
    headerImage: z
      .object({
        guid: z.string(),
        url: z.string(),
        width: z.number(),
        height: z.number(),
        offsetPercentageX: z.number(),
        offsetPercentageY: z.number(),
      })
      .optional(),
  }),
});

export const ErrorResponseSchema = z.object({
  status: z.number(),
  error: z.string(),
  message: z.string().optional(),
});
