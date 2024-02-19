import { z } from "zod"

import { argentNetworkIdSchema, argentBackendNetworkIdSchema } from "./schema"

export type ArgentNetworkId = z.infer<typeof argentNetworkIdSchema>

export type ArgentBackendNetworkId = z.infer<
  typeof argentBackendNetworkIdSchema
>

export function isArgentNetworkId(
  networkId: unknown,
): networkId is ArgentNetworkId {
  return argentNetworkIdSchema.safeParse(networkId).success
}

export function isArgentBackendNetworkId(
  networkId: unknown,
): networkId is ArgentBackendNetworkId {
  return argentBackendNetworkIdSchema.safeParse(networkId).success
}
