import { messageClient } from "../trpc"
import { ClientSignatureReviewService } from "./ClientSignatureReviewService"

export const signatureReviewService = new ClientSignatureReviewService(
  messageClient,
)
