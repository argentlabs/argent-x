import { HTTPService } from "@argent/shared"

export const httpService = new HTTPService({
  headers: {
    "argent-version": process.env.VERSION ?? "Unknown version",
    "argent-client": "argent-x",
  },
})
