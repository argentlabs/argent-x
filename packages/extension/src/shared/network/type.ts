import type { ArgentNetworkId, ArgentBackendNetworkId } from "@argent/x-shared"
import type { z } from "zod"

import type {
  baseNetworkSchema,
  networkSchema,
  colorStatusSchema,
  networkWithStatusSchema,
} from "./schema"

export type BaseNetwork = z.infer<typeof baseNetworkSchema>

export type Network = z.infer<typeof networkSchema>

export type NetworkWithStatus = z.infer<typeof networkWithStatusSchema>

export type ColorStatus = z.infer<typeof colorStatusSchema>

export type DefaultNetworkId = ArgentNetworkId | "localhost" | "integration"

export type PublicRpcNode = Record<ArgentBackendNetworkId, string>
