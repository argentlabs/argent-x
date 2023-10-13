import { ChromeRepository } from "../../storage/__new/chrome"
import { Call } from "starknet"

// TODO: Use zod schema instead of regular types after fixing CallSchema
// export const EstimatedFeesSchema = z.object({
//   amount: z.string(),
//   suggestedMaxFee: z.string(),
//   accountDeploymentFee: z.string().optional(),
//   maxADFee: z.string().optional(),
// })

// export const EstimatedFeesEnrichedSchema = EstimatedFeesWithTxSchema.extend({
//   timestamp: z.number(),
// })

// export type EstimatedFees = z.infer<typeof EstimatedFeesSchema>
// export type EstimatedFeesEnriched = z.infer<typeof EstimatedFeesEnrichedSchema>

export interface EstimatedFees {
  amount: string
  suggestedMaxFee: string
  accountDeploymentFee?: string
  maxADFee?: string
}

export interface EstimatedFeesEnriched extends EstimatedFees {
  transactions: Call[] // only use array as it is easier to compare
  timestamp: number
}

export type IEstimatedFeesRepository = ChromeRepository<EstimatedFeesEnriched>
