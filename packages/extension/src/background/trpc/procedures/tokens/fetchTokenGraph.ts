import { extensionOnlyProcedure } from "../permissions"

import { apiTokenGraphDataSchema } from "../../../../shared/tokenDetails/interface"
import { z } from "zod"
import { addressSchema } from "@argent/x-shared"
import { tokenDetailsService } from "../../../services/tokenDetails"

const fetchTokenGraphSchema = z.object({
  tokenAddress: addressSchema,
  currency: z.string(),
  timeFrame: z.string(),
  chain: z.string(),
})
export const fetchTokenGraphProcedure = extensionOnlyProcedure
  .input(fetchTokenGraphSchema)
  .output(apiTokenGraphDataSchema.optional())
  .query(async ({ input }) => {
    return await tokenDetailsService.fetchTokenGraph(input)
  })
