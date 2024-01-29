import { HTTPService } from "@argent/shared"

import { argentXHeaders } from "../api/headers"

export const httpService = new HTTPService({
  headers: argentXHeaders,
})
