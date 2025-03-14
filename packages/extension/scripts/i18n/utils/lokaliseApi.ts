import { LokaliseApi } from "@lokalise/node-api"
import dotenv from "dotenv"

dotenv.config()

const { LOKALISE_API_TOKEN, LOKALISE_PROJECT_ID } = process.env

export const getLokaliseApi = () => {
  if (!LOKALISE_API_TOKEN) {
    throw new Error("LOKALISE_API_TOKEN is required")
  }

  return new LokaliseApi({
    apiKey: LOKALISE_API_TOKEN,
  })
}

export { LOKALISE_API_TOKEN, LOKALISE_PROJECT_ID }
