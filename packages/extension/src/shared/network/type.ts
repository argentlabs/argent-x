import { z } from "zod"

import { networkSchema, networkStatusSchema } from "./schema"

export type Network = z.infer<typeof networkSchema>

export type NetworkStatus = z.infer<typeof networkStatusSchema>
