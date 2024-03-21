import { HTTPService } from "@argent/x-shared"

import { argentXHeaders } from "../api/headers"

export const httpService = new HTTPService({
  headers: argentXHeaders,
})
