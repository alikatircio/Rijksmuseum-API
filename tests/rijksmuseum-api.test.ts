import { test, expect } from "@playwright/test";
import axios from "axios";
import { z } from "zod";
import { ArtObjectSchema } from "../schema/collectionsSchema";
import { ArtObjectDetailSchema } from "../schema/collectionsSchema";
import { getClient } from "../utils/apiClient";

export const CollectionListSchema = z.object({
  artObjects: z.array(ArtObjectSchema),
});
test.describe("Get a Collection API by language", () => {
  const languages = ["en", "nl"];

  for (const lang of languages) {
    test(`should return valid collection detail in ${lang}`, async () => {
      const client = getClient(lang);
      let objectNumber = "";

      const listResponse =
        await test.step(`Fetch collection list [lang=${lang}]`, async () => {
          const response = await client.get("/collection");
          expect(response.status).toBe(200);
          expect(response.data.artObjects.length).toBeGreaterThan(0);
          CollectionListSchema.parse(response.data);
          return response;
        });

      await test.step("Extract objectNumber from list", async () => {
        objectNumber = listResponse.data.artObjects[0].objectNumber;
        expect(objectNumber).toBeTruthy();
      });

      const detailResponse =
        await test.step(`Fetch details for object: ${objectNumber}`, async () => {
          const response = await client.get(`/collection/${objectNumber}`);
          expect(response.status).toBe(200);
          return response;
        });

      await test.step("Validate response schema", async () => {
        expect(detailResponse.data.artObject).toHaveProperty("id");
        expect(detailResponse.data.artObject).toHaveProperty("title");
        ArtObjectDetailSchema.parse(detailResponse.data);
      });
    });
  }
});

test.describe("Collection API Tests", () => {
  let client: ReturnType<typeof getClient>;

  test.beforeAll(() => {
    client = getClient("en");
  });

  test("should return 404 for invalid endpoint", async () => {
    try {
      await client.get("/collections/BK-NM-1010");
      throw new Error("Request should have failed");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(404);
      } else {
        throw error;
      }
    }
  });

  test.describe("Artist Search Tests", () => {
    const artists = ["Rembrandt", "Vermeer", "Van Gogh"];
    for (const artist of artists) {
      test(`should return results for ${artist}`, async () => {
        const response = await client.get("/collection", {
          params: { q: artist },
        });

        expect(response.status).toBe(200);
        expect(response.data.artObjects.length).toBeGreaterThan(0);

        const found = response.data.artObjects.some((artObject: any) => {
          const maker = artObject.principalOrFirstMaker?.toLowerCase() || "";
          const title = artObject.title?.toLowerCase() || "";
          const longTitle = artObject.longTitle?.toLowerCase() || "";

          return (
            maker.includes(artist.toLowerCase()) ||
            title.includes(artist.toLowerCase()) ||
            longTitle.includes(artist.toLowerCase())
          );
        });

        expect(found).toBe(true);
      });
    }
  });

  test("should limit collections to 5 results with ps parameter", async () => {
    const response = await client.get("/collection", {
      params: { ps: 5 },
    });
    expect(response.status).toBe(200);
    expect(response.data.artObjects.length).toBe(5);
    CollectionListSchema.parse(response.data);
  });

  test("should filter collections with images only", async () => {
    const response = await client.get("/collection", {
      params: { imgonly: true },
    });

    expect(response.status).toBe(200);
    expect(response.data.artObjects.length).toBeGreaterThan(0);

    const artObjects = response.data.artObjects;
    artObjects.forEach((artObject: any) => {
      expect(artObject.webImage).toBeTruthy();
      expect(artObject.webImage.url).toContain("http");
    });
    CollectionListSchema.parse(response.data);
  });

  test("should filter by place Amsterdam", async () => {
    const response = await client.get("/collection", {
      params: { place: "Amsterdam" },
    });
    expect(response.status).toBe(200);
    expect(response.data.artObjects.length).toBeGreaterThan(0);
    const artObjects = response.data.artObjects;
    artObjects.forEach((artObject: any) => {
      if (artObject.productionPlaces.length > 0) {
        expect(artObject.productionPlaces).toContain("Amsterdam");
      }
    });
    CollectionListSchema.parse(response.data);
  });

  test("should paginate collections using p parameter", async () => {
    const page1 = await client.get("/collection", {
      params: { p: 1, ps: 5 },
    });

    const page2 = await client.get("/collection", {
      params: { p: 2, ps: 5 },
    });

    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);

    expect(page1.data.artObjects.length).toBe(5);
    expect(page2.data.artObjects.length).toBe(5);

    const firstPageFirstObject = page1.data.artObjects[0].objectNumber;
    const secondPageFirstObject = page2.data.artObjects[0].objectNumber;

    expect(firstPageFirstObject).not.toBe(secondPageFirstObject);
  });
});
