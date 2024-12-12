import { extensionOnlyProcedure } from "../permissions"

import { z } from "zod"
import { addressSchema } from "@argent/x-shared"

import { activityService } from "../../../services/activity"
import { baseWalletAccountSchema } from "../../../../shared/wallet.model"

const fetchTokenActivitiesSchema = z.object({
  account: baseWalletAccountSchema,
  tokenAddress: addressSchema,
})
export const fetchTokenActivitiesProcedure = extensionOnlyProcedure
  .input(fetchTokenActivitiesSchema)
  .query(async ({ input }) => {
    return await activityService.fetchAccountActivities(
      input.account,
      false,
      input.tokenAddress,
      true,
    )
  })
