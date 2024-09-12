import type { Address } from "@argent/x-shared"
import type { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"
import type { OutsideSignature } from "./schema"

export type SimulateAndReviewPayload = {
  signature: OutsideSignature
  feeTokenAddress: Address
  appDomain?: string
}

export interface ISignatureReviewService {
  simulateAndReview({
    signature,
    feeTokenAddress,
    appDomain,
  }: SimulateAndReviewPayload): Promise<EnrichedSimulateAndReview>
}
