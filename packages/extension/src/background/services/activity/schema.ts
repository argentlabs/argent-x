import { knownDappSchema } from "@argent/x-shared"

// Create a transformed schema
export const knownDappToTargetDappSchema = knownDappSchema
  .pick({
    name: true,
    argentVerified: true,
  })
  .extend({
    description: knownDappSchema.shape.description.default(""),
    logoUrl: knownDappSchema.shape.logoUrl.default(""),
    iconUrl: knownDappSchema.shape.logoUrl.default(""),
    links: knownDappSchema.shape.links.default([]),
  })
