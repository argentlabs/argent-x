import { strkStakingCalldataSchema } from "@argent/x-shared"
import { walletAccountTypeSchema } from "../wallet.model"
import type { z } from "zod"

export const strkStakingCalldataWithAccountTypeSchema =
  strkStakingCalldataSchema.extend({
    accountType: walletAccountTypeSchema,
  })

export type StrkStakingCalldataWithAccountType = z.infer<
  typeof strkStakingCalldataWithAccountTypeSchema
>

export interface BuildSellOpts {
  useFullBalance?: boolean
  subsequentTransaction?: boolean
}
