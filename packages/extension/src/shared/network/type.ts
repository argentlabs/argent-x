import { z } from "zod"

import {
  baseNetworkSchema,
  networkSchema,
  networkStatusSchema,
  networkWithStatusSchema,
} from "./schema"

export type BaseNetwork = z.infer<typeof baseNetworkSchema>

export type Network = z.infer<typeof networkSchema>

export type NetworkWithStatus = z.infer<typeof networkWithStatusSchema>

export type NetworkStatus = z.infer<typeof networkStatusSchema>

export type DefaultNetworkId =
  | "mainnet-alpha"
  | "goerli-alpha"
  | "localhost"
  | "integration"
