import { z } from "zod"
import { ChromeRepository } from "../../storage/__new/chrome"
import { addressSchema } from "@argent/shared"

export const estimatedFeeSchema = z.object({
  feeTokenAddress: addressSchema,
  amount: z.bigint(),
  pricePerUnit: z.bigint(),
  watermarkedMaxFee: z.bigint().optional(), // TODO: Remove this once we have the watermark fee in the amount*pricePerUnit product
})

export type EstimatedFee = z.infer<typeof estimatedFeeSchema>

export const estimatedFeesSchema = z.object({
  deployment: estimatedFeeSchema.optional(),
  transactions: estimatedFeeSchema,
})

export type EstimatedFees = z.infer<typeof estimatedFeesSchema>

export interface EstimatedFeesEnriched extends EstimatedFees {
  id: string
  timestamp: number
}

export type IEstimatedFeesRepository = ChromeRepository<EstimatedFeesEnriched>
