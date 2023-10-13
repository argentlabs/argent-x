import { z } from "zod"

export type Hex = `0x${string}`

export const hexSchemaBase = z
  .string()
  .regex(/^(0x)?[0-9a-fA-F]+$/, "Invalid hex string")

export const hexSchema = hexSchemaBase.transform<Hex>((value) => {
  // remove 0x prefix
  const withoutPrefix = value.startsWith("0x") ? value.slice(2) : value
  // pad left until length is even
  const padded =
    withoutPrefix.length % 2 === 0 ? withoutPrefix : `0${withoutPrefix}`
  // add 0x prefix
  return `0x${padded}`
})
