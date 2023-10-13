import { z } from "zod"

export const dappLinksSchema = z.array(
  z.object({
    name: z.string(),
    url: z.string(),
    position: z.number(),
  }),
)

export const dappContractsSchema = z.array(
  z.object({
    address: z.string(),
    chain: z.string(),
  }),
)

export const knownDappSchema = z.object({
  dappId: z.string(),
  name: z.string(),
  description: z.string(),
  logoUrl: z.string(),
  dappUrl: z.optional(z.string()),
  inAppBrowserCompatible: z.boolean(),
  argentVerified: z.boolean(),
  links: dappLinksSchema,
  contracts: dappContractsSchema,
  categories: z.optional(z.array(z.string())),
  supportedApps: z.optional(z.array(z.string())),
})

export const knownDappsSchema = z.array(knownDappSchema)

export type KnownDapp = z.infer<typeof knownDappSchema>
export type KnownDapps = z.infer<typeof knownDappsSchema>
