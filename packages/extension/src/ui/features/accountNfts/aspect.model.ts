import { BigNumber } from "ethers"
import { z } from "zod"

export const AspectNftOwnerSchema = z.object({
  account_address: z.string(),
  // TODO replace bignumbers with string().pattern(/^0x[0-9a-fA-F]+$/) to validate hexstring
  payment_amount: z
    .string()
    .transform((s) => BigNumber.from(s))
    .optional(),
  payment_amount_per: z
    .string()
    .transform((s) => BigNumber.from(s))
    .optional(),
})

export const AspectNftContractSchema = z.object({
  contract_address: z.string(),
  name: z.string().nullable().optional(),
  symbol: z.string().nullable().optional(),
  schema: z.string(), // Might be useful in future
  name_custom: z.string().nullable(), // Collection Name
  image_url: z.string(),
  floor_list_price: z.string().transform((s) => BigNumber.from(s)),
})

export const AspectNftSchema = z.object({
  best_bid_order: z
    .object({
      payment_address: z.string(),
      payment_amount: z.string().optional(),
      payment_amount_per: z.string().optional(),
    })
    .optional()
    .nullable(),
  contract_address: z.string(),
  token_id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  image_uri: z.string().optional(),
  image_url_copy: z.string().optional(),
  animation_uri: z.string().nullable().optional(),
  external_uri: z.string().nullable().optional(),
  owner: AspectNftOwnerSchema.optional(),
  contract: AspectNftContractSchema,
})

export const AspectContractSchema = z.object({
  contract_address: z.string(),
  name: z.string(),
  symbol: z.string(),
  schema: z.string(),
  name_custom: z.string(),
  image_url: z.string(),
  banner_image_url: z.string(),
  total_volume_all_time: z.string(),
  total_volume_720_hours: z.string(),
  total_volume_168_hours: z.string(),
  total_volume_24_hours: z.string(),
  volume_change_basis_points_720_hours: z.string(),
  volume_change_basis_points_168_hours: z.string().nullable(),
  volume_change_basis_points_24_hours: z.string().nullable(),
  number_of_owners: z.string(),
  number_of_assets: z.string(),
  floor_list_price: z.string(),
})

export const CollectionSchema = z.object({
  name: z.string(),
  contractAddress: z.string(),
  nfts: AspectNftSchema.array(),
  imageUri: z.string().optional(),
  floorPrice: z
    .string()
    .transform((s) => BigNumber.from(s))
    .optional(),
})

export const AspectNftArraySchema = AspectNftSchema.array()
export type AspectNft = z.infer<typeof AspectNftSchema>
export type AspectNftOwner = z.infer<typeof AspectNftOwnerSchema>
export type AspectNftContract = z.infer<typeof AspectNftContractSchema>
export type AspectContract = z.infer<typeof AspectContractSchema>
export type Collection = z.infer<typeof CollectionSchema>
