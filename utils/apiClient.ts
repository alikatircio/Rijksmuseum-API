import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.RIJKSMUSEUM_API_KEY;

if (!BASE_URL || !API_KEY) {
  throw new Error("BASE_URL or RIJKSMUSEUM_API_KEY is not defined in .env");
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

export function getClient(lang: string) {
  const BASE_URL = process.env.BASE_URL;
  const API_KEY = process.env.RIJKSMUSEUM_API_KEY;
  if (!BASE_URL || !API_KEY) {
    throw new Error("Missing BASE_URL or API_KEY");
  }
  return axios.create({
    baseURL: `${BASE_URL}/${lang}`,
    params: {
      key: API_KEY,
    },
  });
}
