import type {
  ISignatureReviewService,
  SimulateAndReviewPayload,
} from "../../../shared/signatureReview/ISignatureReviewService"
import type { messageClient } from "../trpc"

export class ClientSignatureReviewService implements ISignatureReviewService {
  constructor(private readonly trpcClient: typeof messageClient) {}

  async simulateAndReview({
    signature,
    feeTokenAddress,
    appDomain,
  }: SimulateAndReviewPayload) {
    return this.trpcClient.signatureReview.simulateAndReview.query({
      signature,
      feeTokenAddress,
      appDomain,
    })
  }
}
