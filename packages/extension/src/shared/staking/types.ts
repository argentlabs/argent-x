import {
  addressSchema,
  stakingActionSchema,
  strkStakingCalldataSchema,
} from "@argent/x-shared"
import { walletAccountTypeSchema } from "../wallet.model"
import { z } from "zod"

export const strkStakingCalldataWithAccountTypeSchema =
  strkStakingCalldataSchema.extend({
    accountType: walletAccountTypeSchema,
  })

export type StrkStakingCalldataWithAccountType = z.infer<
  typeof strkStakingCalldataWithAccountTypeSchema
>

export const investmentSubmittedRequestSchema = z.object({
  action: stakingActionSchema,
  accountAddress: addressSchema,
  subsequentTransaction: z.boolean().optional(),
  transactionHash: z.string(),
  assets: z.array(
    z.object({
      tokenAddress: addressSchema,
      amount: z.string(),
      useFullBalance: z.boolean().optional(),
    }),
  ),
})

export type InvestmentSubmittedRequest = z.infer<
  typeof investmentSubmittedRequestSchema
>
