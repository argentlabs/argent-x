import { messageClient } from "../trpc"
import { ClientTransactionReviewService } from "./client"

export const clientTransactionReviewService =
  new ClientTransactionReviewService(messageClient)
