import { test, expect } from "@playwright/test";
import axios from "axios";
import { z } from "zod";
import { ArtObjectSchema } from "../schema/collectionsSchema";
import { getClient } from "../utils/apiClient";

export const CollectionListSchema = z.object({
  artObjects: z.array(ArtObjectSchema),
});

const BASE_URL = "https://www.rijksmuseum.nl/api/en/collection";
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
      });
    });
  }
});

test("should return 404 for invalid endpoint", async () => {
  try {
    await axios.get(`${BASE_URL}s/BK-NM-1010`, {
      params: { key: "0fiuZFh4" },
    });
    throw new Error("Request should have failed");
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      expect(error.response?.status).toBe(404);
    } else {
      throw error;
    }
  }
});
