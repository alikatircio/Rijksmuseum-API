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

      await test.step("Validate detail response schema", async () => {
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
    await test.step("Request invalid endpoint and expect 404", async () => {
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
  });

  test.describe("Artist Search Tests", () => {
    const artists = ["Rembrandt", "Vermeer", "Van Gogh"];

    for (const artist of artists) {
      test(`should return results for ${artist}`, async () => {
        const response =
          await test.step(`Search collection for artist: ${artist}`, async () => {
            const res = await client.get("/collection", {
              params: { q: artist },
            });
            expect.soft(res.status).toBe(200);
            expect.soft(res.data.artObjects.length).toBeGreaterThan(0);
            return res;
          });

        await test.step(`Validate results contain artist: ${artist}`, async () => {
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
          expect.soft(found).toBe(true);
        });
      });
    }
  });

  test("should limit collections to 5 results with ps parameter", async () => {
    const response =
      await test.step("Request collections with ps=5", async () => {
        const res = await client.get("/collection", { params: { ps: 5 } });
        expect(res.status).toBe(200);
        return res;
      });

    await test.step("Validate response has exactly 5 collections", async () => {
      expect(response.data.artObjects.length).toBe(5);
      CollectionListSchema.parse(response.data);
    });
  });

  test("should filter collections with images only", async () => {
    const response =
      await test.step("Request collections with images only", async () => {
        const res = await client.get("/collection", {
          params: { imgonly: true },
        });
        expect(res.status).toBe(200);
        return res;
      });

    await test.step("Validate each collection has a valid webImage", async () => {
      expect(response.data.artObjects.length).toBeGreaterThan(0);
      response.data.artObjects.forEach((artObject: any) => {
        expect.soft(artObject.webImage).toBeTruthy();
        expect.soft(artObject.webImage.url).toContain("http");
      });
      CollectionListSchema.parse(response.data);
    });
  });

  test("should filter by place Amsterdam", async () => {
    const response =
      await test.step("Request collections filtered by place: Amsterdam", async () => {
        const res = await client.get("/collection", {
          params: { place: "Amsterdam" },
        });
        expect(res.status).toBe(200);
        return res;
      });

    await test.step("Validate collections belong to Amsterdam", async () => {
      expect(response.data.artObjects.length).toBeGreaterThan(0);
      response.data.artObjects.forEach((artObject: any) => {
        if (artObject.productionPlaces.length > 0) {
          expect.soft(artObject.productionPlaces).toContain("Amsterdam");
        }
      });
      CollectionListSchema.parse(response.data);
    });
  });

  test("should paginate collections using p parameter", async () => {
    const page1 =
      await test.step("Request page 1 with 5 collections", async () => {
        const res = await client.get("/collection", {
          params: { p: 1, ps: 5 },
        });
        expect(res.status).toBe(200);
        return res;
      });

    const page2 =
      await test.step("Request page 2 with 5 collections", async () => {
        const res = await client.get("/collection", {
          params: { p: 2, ps: 5 },
        });
        expect(res.status).toBe(200);
        return res;
      });

    await test.step("Validate pagination returns different collections", async () => {
      expect(page1.data.artObjects.length).toBe(5);
      expect(page2.data.artObjects.length).toBe(5);
      const firstPageFirstObject = page1.data.artObjects[0].objectNumber;
      const secondPageFirstObject = page2.data.artObjects[0].objectNumber;
      expect(firstPageFirstObject).not.toBe(secondPageFirstObject);
    });
  });
});

test.describe("Negative Test Scenarios", () => {
  let client: ReturnType<typeof getClient>;

  test.beforeAll(() => {
    client = getClient("en");
  });

  test("should return 401 for missing API key", async () => {
    await test.step("Request without key param", async () => {
      try {
        await axios.get(
          "https://www.rijksmuseum.nl/api/en/collection?q=rembrandt"
        );
        throw new Error("Request should have failed");
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          expect(error.response?.status).toBe(401);
        } else {
          throw error;
        }
      }
    });
  });

  test("should return 401 for invalid API key", async () => {
    await test.step("Request with invalid key", async () => {
      try {
        await axios.get("https://www.rijksmuseum.nl/api/en/collection", {
          params: {
            key: "INVALID_KEY",
            q: "rembrandt",
          },
        });
        throw new Error("Request should have failed");
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          expect(error.response?.status).toBe(401);
        } else {
          throw error;
        }
      }
    });
  });

  test("should return 200 but empty result for nonsense search", async () => {
    await test.step("Search with meaningless string", async () => {
      const response = await client.get("/collection", {
        params: { q: "asdqwezxc!@#" },
      });

      expect(response.status).toBe(200);
      expect(response.data.artObjects.length).toBe(0);
    });
  });
});
