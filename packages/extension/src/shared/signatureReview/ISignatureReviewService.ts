import type { Address } from "@argent/x-shared"
import type { EnrichedSimulateAndReviewV2 } from "@argent/x-shared/simulation"
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
  }: SimulateAndReviewPayload): Promise<EnrichedSimulateAndReviewV2>
}
