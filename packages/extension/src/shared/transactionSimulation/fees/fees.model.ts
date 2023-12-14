import { z } from "zod"
import { ChromeRepository } from "../../storage/__new/chrome"
import { Call } from "starknet"

export const estimatedFeesSchema = z.object({
  amount: z.string(),
  suggestedMaxFee: z.string(),
  accountDeploymentFee: z.string().optional(),
  maxADFee: z.string().optional(),
})

// export const EstimatedFeesEnrichedSchema = EstimatedFeesWithTxSchema.extend({
//   timestamp: z.number(),
// })

export type EstimatedFees = z.infer<typeof estimatedFeesSchema>

export interface EstimatedFeesEnriched extends EstimatedFees {
  transactions: Call[] // only use array as it is easier to compare
  timestamp: number
}

export type IEstimatedFeesRepository = ChromeRepository<EstimatedFeesEnriched>
