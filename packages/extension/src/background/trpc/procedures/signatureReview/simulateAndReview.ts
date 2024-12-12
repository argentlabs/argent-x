import { z } from "zod"

import { openSessionMiddleware } from "../../middleware/session"
import { extensionOnlyProcedure } from "../permissions"

import { enrichedSimulateAndReviewSchema } from "@argent/x-shared/simulation"
import { addressSchema } from "@argent/x-shared"
import { outsideSignatureSchema } from "../../../../shared/signatureReview/schema"

const simulateAndReviewSchema = z.object({
  feeTokenAddress: addressSchema,
  signature: outsideSignatureSchema,
  appDomain: z.string().optional(),
})

export const simulateAndReviewProcedure = extensionOnlyProcedure
  .use(openSessionMiddleware)
  .input(simulateAndReviewSchema)
  .output(enrichedSimulateAndReviewSchema)
  .query(async ({ input, ctx: { services } }) => {
    const { signatureReviewService } = services
    return signatureReviewService.simulateAndReview(input)
  })