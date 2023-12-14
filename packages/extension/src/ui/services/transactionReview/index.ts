import { messageClient } from "../messaging/trpc"
import { ClientTransactionReviewService } from "./client"

export const clientTransactionReviewService =
  new ClientTransactionReviewService(messageClient)
