import { apiTokenInfoSchema } from "@argent/x-shared"
import { z } from "zod"

export const dbTokenInfoSchema = apiTokenInfoSchema.extend({
  networkId: z.string(),
  updatedAt: z.number().optional(),
})

export type DbTokensInfoResponse = z.infer<typeof dbTokenInfoSchema>

export const tokenInfoByNetworkSchema = z.record(
  z.string(),
  z.object({ updatedAt: z.number(), data: z.array(apiTokenInfoSchema) }),
)

export type TokenInfoByNetwork = z.infer<typeof tokenInfoByNetworkSchema>
